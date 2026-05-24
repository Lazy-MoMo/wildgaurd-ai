from pymongo import MongoClient
from datetime import datetime

db = MongoClient("mongodb://localhost:27017").wildguard

db.animals.drop()
db.animals.insert_many(
    [
        {
            "animal_id": "ELE_001",
            "species": "elephant",
            "collar_id": "COL_001",
            "current_location": {"lat": 27.5289, "lng": 84.3564},
            "last_seen": datetime.utcnow(),
            "status": "active",
            "herd_id": "HERD_A",
        },
        {
            "animal_id": "ELE_002",
            "species": "elephant",
            "collar_id": "COL_002",
            "current_location": {"lat": 27.5320, "lng": 84.3610},
            "last_seen": datetime.utcnow(),
            "status": "active",
            "herd_id": "HERD_A",
        },
    ]
)
print("Seeded.")
