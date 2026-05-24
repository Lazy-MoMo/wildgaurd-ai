"""
Train the LSTM breach predictor.
Run: python -m ml.models.breach_predictor_lstm
Input:  48 time steps × 6 features (30-min intervals = last 24h)
Output: P(breach in next 6-12 hours)
"""
import numpy as np
import tensorflow as tf
from tensorflow import keras
import os

SEQUENCE_LEN  = 48   # 24 hours at 30-min intervals
N_FEATURES    = 6    # lat, lng, speed, direction, distance_to_boundary, behavior_enc
EPOCHS        = 30
BATCH_SIZE    = 64

def build_model() -> keras.Model:
    model = keras.Sequential([
        keras.layers.Input(shape=(SEQUENCE_LEN, N_FEATURES)),
        keras.layers.LSTM(64, return_sequences=True),
        keras.layers.Dropout(0.2),
        keras.layers.LSTM(32),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(16, activation="relu"),
        keras.layers.Dense(1, activation="sigmoid"),  # breach probability
    ])
    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy", keras.metrics.AUC(name="auc")]
    )
    model.summary()
    return model

def train(X: np.ndarray, y: np.ndarray, output_dir: str = "./ml_artifacts"):
    """
    X: (n_samples, SEQUENCE_LEN, N_FEATURES)
    y: (n_samples,) — 1 if breach occurred in next 6-12h, else 0
    """
    os.makedirs(output_dir, exist_ok=True)
    model = build_model()

    split = int(len(X) * 0.8)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    callbacks = [
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ModelCheckpoint(
            f"{output_dir}/breach_predictor.h5", save_best_only=True
        ),
    ]
    model.fit(X_train, y_train,
              validation_data=(X_val, y_val),
              epochs=EPOCHS,
              batch_size=BATCH_SIZE,
              callbacks=callbacks)

    print(f"✅ Model saved to {output_dir}/breach_predictor.h5")
    return model

if __name__ == "__main__":
    # TODO: load real sequence data from preprocessing pipeline
    print("Load processed sequences and call train(X, y)")
