import sys
import os
import pytest
from fastapi.testclient import TestClient

# Backend modülünü bulabilmek için yolu ayarla
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(PROJECT_ROOT)

from backend.main import app

client = TestClient(app)

def test_api_is_running():
    """Ana endpoint'in çalışıp çalışmadığını test eder."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "IDAS Backend is running"}

def test_classify_endpoint():
    """Gereksinim yazıp 'classify' edip etmediğini test eder."""
    payload = {"text": "Sistem veritabanı çöktüğünde 5 saniye içerisinde yedeğe geçmelidir."}
    response = client.post("/classify", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "result" in data
    # Sonuç LLM'den geldiği için tam metni bilemeyiz ama boş olmamalı
    assert isinstance(data["result"], str)
    assert len(data["result"]) > 0
    print(f"Classify Sonucu: {data['result']}")

def test_analyze_endpoint():
    """Bir gereksinimin analiz çalışıp çalışmadığını test eder."""
    payload = {"text": "Sistem çok hızlı çalışmalı ve verileri güvenli tutmalıdır."}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "result" in data
    # Analyze sonucu liste dönüyor
    assert isinstance(data["result"], (list, dict, str))
    assert len(data["result"]) > 0
    print(f"Analyze Sonucu: {data['result']}")

def test_rewrite_endpoint():
    """Sistemin hatalı bir gereksinim için öneri üretip üretmediğini test eder."""
    payload = {
        "text": "Sistem çok hızlı çalışmalı.",
        "issue": "Ambiguity (Belirsizlik) - 'Çok hızlı' ölçülebilir değil.",
        "suggestion": "Sistem sayfa yüklemelerini 2 saniyenin altında tamamlamalıdır."
    }
    response = client.post("/rewrite", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "result" in data
    assert isinstance(data["result"], str)
    assert len(data["result"]) > 0
    print(f"Rewrite Sonucu: {data['result']}")

from unittest.mock import patch

@patch('backend.main.DocumentParser.parse')
def test_upload_review_endpoint(mock_parse):
    """Belge yükle -> analiz çalışıyor mu senaryosu."""
    # Parser'ın döndüreceği metni mocklayalım ki PDF okuma zorunluluğunu atlayalım
    mock_parse.return_value = "1. Kullanici sifreleri duz metin olarak saklanacaktir.\n2. Sistem her istege 1 saniyede cevap verecektir."
    
    # Fake bir dosya yollayalım (pdf isminde olsun)
    file_content = b"fake pdf content"
    files = {"file": ("test_requirements.pdf", file_content, "application/pdf")}
    
    response = client.post("/upload-review", files=files)
    
    assert response.status_code == 200
    data = response.json()
    
    # Hata dönmemesi lazım
    assert "error" not in data, f"Hata döndü: {data.get('error')}"
    # Sonucun dolu gelmesi lazım (Dict veya List formatında olabilir, projenize göre)
    assert data is not None

