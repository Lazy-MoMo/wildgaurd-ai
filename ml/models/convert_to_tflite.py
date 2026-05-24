"""
Convert the trained Random Forest movement classifier to TensorFlow Lite
for deployment on the ESP32.

Strategy: wrap the sklearn RF in a TF graph via tf.lite.TFLiteConverter.
"""
import tensorflow as tf
import joblib, numpy as np

def convert_rf_to_tflite(rf_model_path: str, output_path: str):
    clf = joblib.load(rf_model_path)
    N_TREES = len(clf.estimators_)
    print(f"Loaded RF with {N_TREES} trees, {clf.n_features_in_} features")

    # Wrap prediction as a TF function
    @tf.function(input_signature=[tf.TensorSpec(shape=[1, clf.n_features_in_], dtype=tf.float32)])
    def predict(x):
        # Use sklearn model embedded via tf.py_function
        def _predict(x_np):
            proba = clf.predict_proba(x_np.numpy())
            return proba.astype(np.float32)
        result = tf.py_function(_predict, [x], tf.float32)
        result.set_shape([1, len(clf.classes_)])
        return result

    converter = tf.lite.TFLiteConverter.from_concrete_functions(
        [predict.get_concrete_function()]
    )
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    with open(output_path, "wb") as f:
        f.write(tflite_model)
    print(f"✅ TFLite model saved to {output_path} ({len(tflite_model)/1024:.1f} KB)")

if __name__ == "__main__":
    convert_rf_to_tflite(
        "ml_artifacts/movement_classifier.joblib",
        "ml_artifacts/movement_classifier.tflite"
    )
