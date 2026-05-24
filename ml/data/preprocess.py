"""
Preprocess raw movement CSV into:
1. movements_labeled.csv      — for Random Forest training
2. sequences_breach.npy/npy   — (X, y) arrays for LSTM training
"""
import numpy as np
import pandas as pd

SEQUENCE_LEN = 48  # 24h at 30-min intervals

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["animal_id", "timestamp"]).copy()
    hour = pd.to_datetime(df["timestamp"]).dt.hour
    df["time_sin"] = np.sin(2 * np.pi * hour / 24)
    df["time_cos"] = np.cos(2 * np.pi * hour / 24)
    df["speed_change"] = df.groupby("animal_id")["speed"].diff().fillna(0)
    df["direction_change"] = df.groupby("animal_id")["direction"].diff().abs().fillna(0)
    df["rolling_avg_speed_6h"] = (
        df.groupby("animal_id")["speed"]
        .transform(lambda x: x.rolling(12, min_periods=1).mean())
    )
    # Simple breach label: distress/aggressive behavior within next 6h
    df["breach"] = (df["behavior"].isin(["distress", "aggressive"])).astype(int)
    return df

def build_sequences(df: pd.DataFrame):
    FEATURES = ["lat", "lng", "speed", "direction", "speed_change", "rolling_avg_speed_6h"]
    X_list, y_list = [], []
    for aid, group in df.groupby("animal_id"):
        group = group.reset_index(drop=True)
        for i in range(len(group) - SEQUENCE_LEN - 12):
            seq = group.loc[i:i+SEQUENCE_LEN-1, FEATURES].values
            # Label: did breach happen in next 12 steps (6h)?
            future = group.loc[i+SEQUENCE_LEN:i+SEQUENCE_LEN+12, "breach"].values
            label = int(future.any())
            X_list.append(seq)
            y_list.append(label)
    return np.array(X_list, dtype=np.float32), np.array(y_list, dtype=np.float32)

if __name__ == "__main__":
    df = pd.read_csv("ml/data/raw/movements_simulated.csv", parse_dates=["timestamp"])
    df = add_features(df)
    df.to_csv("ml/data/processed/movements_labeled.csv", index=False)
    X, y = build_sequences(df)
    np.save("ml/data/processed/X_sequences.npy", X)
    np.save("ml/data/processed/y_breach.npy", y)
    print(f"✅ Sequences: X={X.shape}, y={y.shape}, breach_rate={y.mean():.2%}")
