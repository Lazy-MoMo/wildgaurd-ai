"""
AlertService — persists alert, activates collar deterrents via LoRa gateway,
sends SMS to villages, notifies rangers.
"""
from datetime import datetime
from ..models.alert import AlertCreate
from ..database import get_db
from .sms_service import SMSService

DETERRENT_MAP = {0: "none", 1: "vibration", 2: "vibration+audio", 3: "full"}

class AlertService:
    def __init__(self):
        self.sms = SMSService()

    async def dispatch(self, alert: AlertCreate) -> dict:
        db = get_db()
        deterrent = DETERRENT_MAP.get(alert.alert_level, "none")

        doc = {
            **alert.model_dump(),
            "timestamp": datetime.utcnow(),
            "deterrent_activated": deterrent,
            "resolved": False,
        }
        result = await db.alerts.insert_one(doc)

        # Level 2+: SMS to nearby villages
        if alert.alert_level >= 2:
            for village in alert.villages_notified:
                await self.sms.send(village, alert.animal_id, alert.risk_score)

        # Level 3: ranger notification
        if alert.alert_level == 3:
            # TODO: send push notification to ranger mobile app
            pass

        # TODO: send deterrent command to collar via LoRa MQTT topic
        # mqtt_client.publish(f"collar/{alert.animal_id}/deterrent", deterrent)

        return {"alert_id": str(result.inserted_id), "deterrent": deterrent}
