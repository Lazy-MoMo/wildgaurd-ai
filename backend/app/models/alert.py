from pydantic import BaseModel
from datetime import datetime
from typing import List

class Alert(BaseModel):
    animal_id: str
    timestamp: datetime
    alert_level: int              # 0-3
    risk_score: int               # 0-100
    villages_notified: List[str]
    deterrent_activated: str      # none | vibration | vibration+audio | full
    resolved: bool = False

class AlertCreate(BaseModel):
    animal_id: str
    alert_level: int
    risk_score: int
    villages_notified: List[str] = []
