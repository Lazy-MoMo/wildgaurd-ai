from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017/wildguard"
    secret_key: str = "dev-secret"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    openweather_api_key: str = ""
    movement_model_path: str = "./ml_artifacts/movement_classifier.joblib"
    lstm_model_path: str = "./ml_artifacts/breach_predictor.h5"

    class Config:
        env_file = ".env"

settings = Settings()
