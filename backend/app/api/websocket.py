from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio, json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, event_type: str, data: dict):
        msg = json.dumps({"type": event_type, "data": data})
        for ws in self.active:
            try:
                await ws.send_text(msg)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/api/live")
async def live_feed(websocket: WebSocket):
    """
    WebSocket endpoint — push real-time animal_update, new_alert,
    and geofence_update events to all connected dashboard clients.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; broadcasting is triggered by services
            await asyncio.sleep(30)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Expose manager so services can broadcast
def get_ws_manager() -> ConnectionManager:
    return manager
