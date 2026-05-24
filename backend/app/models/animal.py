from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Location(BaseModel):
    lat: float
    lng: float

class Animal(BaseModel):
    animal_id: str              # e.g. "ELE_001"
    species: str                # elephant | tiger | leopard
    collar_id: str
    current_location: Location
    last_seen: datetime
    status: str = "active"      # active | inactive | collar_off
    herd_id: Optional[str] = None

class AnimalCreate(BaseModel):
    animal_id: str
    species: str
    collar_id: str
    herd_id: Optional[str] = None
