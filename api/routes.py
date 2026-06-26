from __future__ import annotations

import uuid
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import text, or_
from sqlalchemy.orm import Session

from .models import Container, ContainerStatus, Item, ItemTag, Location, Tag
from .schemas import (
    ContainerCreate,
    ItemCreate,
    Item as ItemSchema,
    LocationCreate,
    SearchResult,
    SyncPayload,
)
from .database import get_db
from .services import hybrid_search, generate_qr_token, upload_image, LWW_RESOLVER

router = APIRouter(prefix="/api/v1")

QR_PATTERN = re.compile(r"^shi://box/([a-f0-9\-]{36})$")


# ─── Locations ───────────────────────────────────────────────


@router.post("/locations")
def create_location(body: LocationCreate, db: Session = Depends(get_db)):
    loc = Location(name=body.name, description=body.description, parent_id=body.parent_id)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.get("/locations")
def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()


@router.get("/locations/{location_id}")
def get_location(location_id: uuid.UUID, db: Session = Depends(get_db)):
    loc = db.get(Location, location_id)
    if not loc:
        raise HTTPException(404, "Location not found")
    return loc


# ─── Containers ──────────────────────────────────────────────


@router.post("/containers")
def create_container(body: ContainerCreate, db: Session = Depends(get_db)):
    exists = db.query(Container).filter(Container.qr_token == body.qr_token).first()
    if exists:
        raise HTTPException(409, "Container with this QR token already exists")

    c = Container(
        qr_token=body.qr_token,
        name=body.name,
        description=body.description,
        location_id=body.location_id,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/containers/lookup")
def lookup_container(token: str = Query(...), db: Session = Depends(get_db)):
    """Flow 1: skanowanie istniejącego QR kodu."""
    c = db.query(Container).filter(Container.qr_token == token).first()
    if not c:
        raise HTTPException(404, "Container not found")

    items = db.query(Item).filter(Item.container_id == c.id).all()
    return {
        "container": ContainerCreate(
            qr_token=c.qr_token,
            name=c.name,
            description=c.description,
            location_id=c.location_id,
        ),
        "items": items,
    }


@router.get("/containers")
def list_containers(location_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    q = db.query(Container).filter(Container.status == ContainerStatus.ACTIVE)
    if location_id:
        q = q.filter(Container.location_id == location_id)
    return q.all()


# ─── Items ───────────────────────────────────────────────────


@router.post("/items")
def create_item(body: ItemCreate, db: Session = Depends(get_db)):
    """Flow z pseudokodu: NLP → embedding → tagowanie."""
    from sentence_transformers import SentenceTransformer  # type: ignore[import-untyped]

    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    text_for_embed = f"{body.name} {body.description or ''}"
    vector = embedder.encode(text_for_embed).tolist()

    item = Item(
        container_id=body.container_id,
        name=body.name,
        description=body.description,
        description_embedding=vector,
        images=body.images,
        metadata=body.metadata,
    )
    db.add(item)
    db.flush()

    # tagi
    if body.tags:
        for tag_name in body.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.flush()
            db.add(ItemTag(item_id=item.id, tag_id=tag.id))

    db.commit()
    db.refresh(item)
    return item


@router.get("/items/search")
def search_items(q: str = Query(...), db: Session = Depends(get_db)):
    """Hybrydowe wyszukiwanie: BM25 + pgvector cosine similarity."""
    results = hybrid_search(db, q)
    return results


@router.get("/items/{item_id}")
def get_item(item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    return item


@router.patch("/items/{item_id}/move")
def move_item(item_id: uuid.UUID, target_container_id: uuid.UUID, db: Session = Depends(get_db)):
    """Transfer przedmiotu między kontenerami."""
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    container = db.get(Container, target_container_id)
    if not container:
        raise HTTPException(404, "Target container not found")
    item.container_id = target_container_id
    db.commit()
    return {"status": "moved", "item_id": str(item_id)}


# ─── QR Flow 2: parowanie ────────────────────────────────────


@router.get("/qr/parse")
def parse_qr(raw: str = Query(...)):
    """Sprawdza czy QR URI jest poprawny."""
    match = QR_PATTERN.match(raw)
    if not match:
        raise HTTPException(400, "Invalid QR format — expected shi://box/{uuid}")
    return {"qr_token": raw, "valid": True}


@router.post("/qr/generate")
def generate_qr():
    """Generuje nowy token QR (UUIDv4) dla rolki etykiet."""
    return {"qr_token": generate_qr_token()}


# ─── Offline sync ────────────────────────────────────────────


@router.post("/sync")
def sync(body: SyncPayload, db: Session = Depends(get_db)):
    """LWW conflict resolution dla offline sync."""
    results = []
    for action in body.actions:
        result = LWW_RESOLVER.apply(db, action.model_dump())
        results.append(result)
    db.commit()
    return {"synced": len(results), "results": results}


# ─── Image upload ────────────────────────────────────────────


@router.post("/upload")
async def upload(file: UploadFile):
    url = await upload_image(file)
    return {"url": url}


# ─── Container soft-delete ───────────────────────────────────


@router.delete("/containers/{container_id}")
def delete_container(container_id: uuid.UUID, db: Session = Depends(get_db)):
    """Soft-delete: odłącza przedmioty, archiwizuje kontener."""
    c = db.get(Container, container_id)
    if not c:
        raise HTTPException(404, "Container not found")

    # odłącz przedmioty
    db.query(Item).filter(Item.container_id == container_id).update(
        {Item.container_id: None}
    )
    # oznacz jako archiwum
    c.status = ContainerStatus.ARCHIVED
    db.commit()
    return {"status": "archived", "container_id": str(container_id)}
