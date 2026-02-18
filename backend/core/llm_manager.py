import google.generativeai as genai
from backend.config import Config

class LLMManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LLMManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        if not Config.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found via Config.")
        genai.configure(api_key=Config.GOOGLE_API_KEY)

    def get_model(self, model_name=None):
        model_name = model_name or Config.GEMINI_MODEL
        return genai.GenerativeModel(model_name)
