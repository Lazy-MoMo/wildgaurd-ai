"""
SMSService — sends SMS alerts to village contacts via Twilio.
"""
from ..config import settings

class SMSService:
    def __init__(self):
        self.enabled = bool(settings.twilio_account_sid)
        if self.enabled:
            from twilio.rest import Client
            self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)

    async def send(self, village: str, animal_id: str, risk_score: int):
        msg = (
            f"⚠️ WildGuard Alert: Animal {animal_id} approaching {village}. "
            f"Risk score: {risk_score}/100. Take precautions."
        )
        if not self.enabled:
            print(f"[SMS MOCK] → {village}: {msg}")
            return
        # TODO: look up village phone number from DB
        # self.client.messages.create(to=village_phone, from_=settings.twilio_phone_number, body=msg)
