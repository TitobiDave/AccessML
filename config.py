"""Central settings, loaded from environment variables / .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./accessml.db"
    cors_origins: list[str] = ["http://localhost:5173"]

    groq_api_key: str = ""
    groq_model: str = "qwen-2.5-coder-32b"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    quiz_pass_ratio: float = 0.7
    require_completion_for_certificate: bool = False
    course_title: str = "Supervised Machine Learning & Python Foundations"


settings = Settings()