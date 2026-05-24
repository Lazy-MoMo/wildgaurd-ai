from fastapi import APIRouter, HTTPException
from ..database import get_db
from ..services.prediction_engine import PredictionEngine

router = APIRouter()
engine = PredictionEngine()

@router.get("/{animal_id}")
async def get_prediction(animal_id: str):
    """Run LSTM prediction for given animal and return risk score."""
    db = get_db()
    # Fetch last 24h of movements (48 data points at 30-min intervals)
    movements = await db.movements.find(
        {"animal_id": animal_id}
    ).sort("timestamp", -1).limit(48).to_list(length=48)

    if len(movements) < 10:
        raise HTTPException(status_code=400, detail="Not enough movement history")

    prediction = await engine.predict(animal_id, movements)
    await db.predictions.insert_one(prediction.model_dump())
    return prediction
