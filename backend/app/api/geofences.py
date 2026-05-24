from fastapi import APIRouter
from ..database import get_db

router = APIRouter()

@router.get("/")
async def get_geofences():
    """Return all geofence polygons with current dynamic status."""
    db = get_db()
    fences = await db.geofences.find().to_list(length=50)
    for f in fences:
        f["_id"] = str(f["_id"])
    return fences
