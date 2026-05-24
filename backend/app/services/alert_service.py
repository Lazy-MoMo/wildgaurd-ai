"""
AlertService — persists alert and sends SMS to villages.
No LoRa: the collar just POSTs data; backend handles all intelligence.
Alert feedback to collar is not needed — deterrents removed from hardware scope.
"""
from datetime import datetime
from ..models.alert import AlertCreate
from ..database import get_db
from .sms_service import SMSService

DETERRENT_MAP = {0: "none", 1: "watch", 2: "sms_alert", 3: "sms_alert+ranger"}

class AlertService:
    def __init__(self):
        self.sms = SMSService()

    async def dispatch(self, alert: AlertCreate) -> dict:
        db = get_db()
        action = DETERRENT_MAP.get(alert.alert_level, "none")

        doc = {
            **alert.model_dump(),
            "timestamp": datetime.utcnow(),
            "action": action,
            "resolved": False,
        }
        result = await db.alerts.insert_one(doc)

        if alert.alert_level >= 2:
            for village in alert.villages_notified:
                await self.sms.send(village, alert.animal_id, alert.risk_score)

        if alert.alert_level == 3:
            # TODO: push notification to ranger mobile app / WhatsApp
            pass

        return {"alert_id": str(result.inserted_id), "action": action}
