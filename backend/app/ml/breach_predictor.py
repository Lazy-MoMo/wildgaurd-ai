"""
BreachPredictor — LSTM model that ingests 24h of movement sequences
and outputs a probability (0–1) that the animal crosses a geofence
boundary in the next 6–12 hours.
"""
import numpy as np

class BreachPredictor:
    def __init__(self, model_path: str = None):
        self.model = None
        if model_path:
            self.load(model_path)

    def load(self, path: str):
        import tensorflow as tf
        self.model = tf.keras.models.load_model(path)

    def predict(self, sequence: np.ndarray) -> float:
        """
        sequence: shape (1, T, features) — last 24h of GPS readings.
        Returns breach probability in [0, 1].
        """
        if self.model is None:
            # Deterministic stub: high speed + recent direction change = higher risk
            if sequence.shape[1] > 0:
                speeds = sequence[0, :, 2]   # speed column
                return float(np.clip(np.mean(speeds) / 10.0, 0, 1))
            return 0.3  # default stub

        prob = self.model.predict(sequence, verbose=0)[0][0]
        return float(prob)
