import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Proje kök dizinini bul (backend klasörünün bir üstü)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
    
    # DB yolunu proje kök dizinine göre ayarla
    CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", os.path.join(BASE_DIR, "idas_data"))
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
