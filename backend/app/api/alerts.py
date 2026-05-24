from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from ..database import get_db
from ..models.alert import AlertCreate
from ..services.alert_service import AlertService

router = APIRouter()
alert_service = AlertService()

@router.get("/")
async def get_alerts(hours: int = Query(default=24, ge=1, le=168)):
    """Get recent alerts. Default: last 24 hours."""
    db = get_db()
    since = datetime.utcnow() - timedelta(hours=hours)
    alerts = await db.alerts.find(
        {"timestamp": {"$gte": since}}
    ).sort("timestamp", -1).to_list(length=500)
    for a in alerts:
        a["_id"] = str(a["_id"])
    return alerts

@router.post("/")
async def trigger_alert(alert: AlertCreate):
    """Manually trigger an alert (e.g. from ranger in the field)."""
    db = get_db()
    result = await alert_service.dispatch(alert)
    return result

@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert as resolved."""
    from bson import ObjectId
    db = get_db()
    await db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"resolved": True}}
    )
    return {"status": "resolved"}
