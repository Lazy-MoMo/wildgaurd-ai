from fastapi import APIRouter
from datetime import datetime, timedelta
from ..database import get_db

router = APIRouter()

@router.get("/")
async def get_stats():
    """Dashboard summary statistics."""
    db = get_db()
    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)

    total_animals   = await db.animals.count_documents({"status": "active"})
    alerts_today    = await db.alerts.count_documents({"timestamp": {"$gte": last_24h}})
    high_risk_now   = await db.predictions.count_documents({"risk_score": {"$gte": 60}})
    conflicts_prevented = await db.alerts.count_documents({
        "timestamp": {"$gte": last_24h}, "resolved": True
    })

    return {
        "total_animals_tracked": total_animals,
        "alerts_last_24h": alerts_today,
        "high_risk_animals": high_risk_now,
        "conflicts_prevented_today": conflicts_prevented,
        "system_uptime": "100%",
    }
