from pydantic import BaseModel
from typing import List

class GeofenceContext(BaseModel):
    season: str              # winter | summer | monsoon
    time: str                # day | night
    crop_status: str         # growing | harvesting | fallow

class Geofence(BaseModel):
    name: str
    polygon: List[List[float]]   # [[lat, lng], ...]
    dynamic: bool = True
    current_status: str = "active"
    risk_level: str = "low"      # low | medium | high | critical
    context: GeofenceContext
