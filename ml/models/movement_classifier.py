"""
Train the Random Forest movement classifier.
Run: python -m ml.models.movement_classifier
Saves: ml_artifacts/movement_classifier.joblib + movement_classifier.tflite
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib, os

BEHAVIOR_CLASSES = ["grazing", "resting", "moving", "distress", "aggressive"]
FEATURES = ["speed", "direction", "time_sin", "time_cos",
            "speed_change", "direction_change", "rolling_avg_speed_6h"]

def load_data(csv_path: str) -> pd.DataFrame:
    """
    Expected CSV columns: timestamp, animal_id, lat, lng,
    speed, direction, behavior
    """
    df = pd.read_csv(csv_path, parse_dates=["timestamp"])
    df = df.sort_values(["animal_id", "timestamp"])

    hour = df["timestamp"].dt.hour
    df["time_sin"] = np.sin(2 * np.pi * hour / 24)
    df["time_cos"] = np.cos(2 * np.pi * hour / 24)
    df["speed_change"] = df.groupby("animal_id")["speed"].diff().fillna(0)
    df["direction_change"] = df.groupby("animal_id")["direction"].diff().abs().fillna(0)
    df["rolling_avg_speed_6h"] = (
        df.groupby("animal_id")["speed"]
        .transform(lambda x: x.rolling(12, min_periods=1).mean())
    )
    return df

def train(csv_path: str, output_dir: str = "./ml_artifacts"):
    df = load_data(csv_path)
    X = df[FEATURES].values
    y = df["behavior"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    print(classification_report(y_test, clf.predict(X_test)))

    os.makedirs(output_dir, exist_ok=True)
    joblib.dump(clf, f"{output_dir}/movement_classifier.joblib")
    print(f"✅ Saved to {output_dir}/movement_classifier.joblib")
    return clf

if __name__ == "__main__":
    train("ml/data/processed/movements_labeled.csv")
