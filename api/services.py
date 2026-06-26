from __future__ import annotations

import uuid
import datetime
from typing import Any

from sqlalchemy import func, or_, text
from sqlalchemy.orm import Session

from .models import Container, Item


# ─── QR ──────────────────────────────────────────────────────


def generate_qr_token() -> str:
    return f"shi://box/{uuid.uuid4()}"


# ─── Hybrydowe wyszukiwanie ──────────────────────────────────


def hybrid_search(db: Session, query: str, w1: float = 0.3, w2: float = 0.7) -> list[dict]:
    """
    Score = (w1 * BM25_Score) + (w2 * Cosine_Similarity)
    Item boost: +20%
    """
    from sentence_transformers import SentenceTransformer

    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    query_vec = embedder.encode(query).tolist()

    # 1. Full-text search na Item.name + Item.description
    tsquery = func.plainto_tsquery("english", query)
    lexical = (
        db.query(
            Item,
            func.ts_rank(
                func.to_tsvector("english", Item.name + " " + func.coalesce(Item.description, "")),
                tsquery,
            ).label("bm25_score"),
        )
        .filter(
            or_(
                func.to_tsvector("english", Item.name).op("@@")(tsquery),
                func.to_tsvector("english", func.coalesce(Item.description, "")).op("@@")(tsquery),
            )
        )
        .all()
    )

    # 2. Vector search (cosine similarity)
    vector_expr = func.cos_dist(Item.description_embedding, query_vec)
    semantic = (
        db.query(Item, vector_expr.label("cos_dist"))
        .filter(Item.description_embedding.isnot(None))
        .order_by(vector_expr)
        .limit(50)
        .all()
    )

    # 3. Fuzja wyników
    scores: dict[str, dict[str, Any]] = {}
    for item, bm25 in lexical:
        item_id = str(item.id)
        scores.setdefault(item_id, {"item": item, "bm25": 0.0, "cosine": 0.0})
        scores[item_id]["bm25"] = float(bm25) if bm25 else 0.0

    for item, cos_dist in semantic:
        item_id = str(item.id)
        scores.setdefault(item_id, {"item": item, "bm25": 0.0, "cosine": 0.0})
        # cos_dist = 1 - cosine_similarity → similarity = 1 - cos_dist
        scores[item_id]["cosine"] = 1.0 - float(cos_dist) if cos_dist else 0.0

    results = []
    for item_id, data in scores.items():
        item = data["item"]
        score = w1 * data["bm25"] + w2 * data["cosine"]
        match_type = "hybrid" if data["bm25"] and data["cosine"] else "semantic" if data["cosine"] else "lexical"

        # Boost +20% dla Item (domyślnie — już Item, więc boost od Container nie aplikujemy)
        results.append(
            {
                "item_id": str(item.id),
                "name": item.name,
                "description": item.description,
                "score": round(score, 4),
                "match_type": match_type,
            }
        )

    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:20]


# ─── LWW Conflict Resolution ─────────────────────────────────


class LWWResolver:
    """Last-Write-Wins na poziomie atrybutów."""

    def apply(self, db: Session, action: dict) -> dict:
        ts = datetime.datetime.fromisoformat(action["timestamp"])
        entity = action["entity"]
        entity_id = uuid.UUID(action["entity_id"])
        data = action["data"]
        op = action["action"]

        model_map = {
            "item": Item,
            "container": Container,
        }
        model = model_map.get(entity)
        if not model:
            return {"status": "skipped", "reason": f"Unknown entity: {entity}"}

        existing = db.get(model, entity_id)

        if op == "DELETE":
            if existing:
                db.delete(existing)
            return {"status": "deleted", "entity_id": str(entity_id)}

        if op == "INSERT":
            if existing:
                return {"status": "conflict", "entity_id": str(entity_id), "resolution": "skipped"}
            obj = model(id=entity_id, **data)
            db.add(obj)
            return {"status": "inserted", "entity_id": str(entity_id)}

        if op == "UPDATE":
            if not existing:
                return {"status": "skipped", "reason": "not_found"}
            for key, val in data.items():
                setattr(existing, key, val)
            return {"status": "updated", "entity_id": str(entity_id)}

        return {"status": "skipped", "reason": f"Unknown action: {op}"}


LWW_RESOLVER = LWWResolver()


# ─── Image upload ────────────────────────────────────────────


async def upload_image(file) -> str:
    """Placeholder — docelowo AWS S3 / Cloudflare R2."""
    import hashlib
    import os

    content = await file.read()
    ext = os.path.splitext(file.filename or "image.jpg")[1]
    hashname = hashlib.sha256(content).hexdigest()[:16]
    dest = f"/tmp/uploads/{hashname}{ext}"
    os.makedirs("/tmp/uploads", exist_ok=True)
    with open(dest, "wb") as f:
        f.write(content)
    return f"file://{dest}"
