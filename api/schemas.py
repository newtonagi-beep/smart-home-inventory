from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class LocationCreate(BaseModel):
    name: str = Field(max_length=100)
    description: str | None = None
    parent_id: uuid.UUID | None = None


class Location(LocationCreate):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContainerCreate(BaseModel):
    qr_token: str
    name: str = Field(max_length=100)
    description: str | None = None
    location_id: uuid.UUID


class Container(ContainerCreate):
    id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ItemCreate(BaseModel):
    container_id: uuid.UUID | None = None
    name: str = Field(max_length=255)
    description: str | None = None
    images: list[str] | None = None
    metadata: dict | None = None
    tags: list[str] | None = None


class Item(ItemCreate):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SearchResult(BaseModel):
    item: Item
    score: float
    match_type: str  # "lexical" | "semantic" | "hybrid"


class SyncAction(BaseModel):
    action: str  # "INSERT" | "UPDATE" | "DELETE"
    entity: str  # "item" | "container" | "location"
    entity_id: uuid.UUID
    data: dict
    timestamp: datetime


class SyncPayload(BaseModel):
    actions: list[SyncAction]
    device_id: str
