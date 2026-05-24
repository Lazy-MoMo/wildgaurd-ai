from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
from ..database import get_db

router = APIRouter()

@router.get("/")
async def list_animals():
    """List all tracked animals with current location and status."""
    db = get_db()
    animals = await db.animals.find().to_list(length=100)
    for a in animals:
        a["_id"] = str(a["_id"])
    return animals

@router.get("/{animal_id}")
async def get_animal(animal_id: str):
    """Get single animal details + last 24h movements."""
    db = get_db()
    animal = await db.animals.find_one({"animal_id": animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    animal["_id"] = str(animal["_id"])

    since = datetime.utcnow() - timedelta(hours=24)
    movements = await db.movements.find(
        {"animal_id": animal_id, "timestamp": {"$gte": since}}
    ).sort("timestamp", -1).to_list(length=200)
    for m in movements:
        m["_id"] = str(m["_id"])

    return {"animal": animal, "recent_movements": movements}

@router.post("/movement")
async def ingest_movement(data: dict):
    """Ingest a new GPS reading from a collar (called by the gateway)."""
    db = get_db()
    # TODO: run edge-side behavior classification here via movement_classifier
    data["timestamp"] = datetime.utcnow()
    await db.movements.insert_one(data)
    await db.animals.update_one(
        {"animal_id": data["animal_id"]},
        {"$set": {"current_location": data["location"], "last_seen": data["timestamp"]}}
    )
    return {"status": "ok"}
