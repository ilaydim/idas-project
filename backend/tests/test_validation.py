import sys
import os
import pytest
import time
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(PROJECT_ROOT)

from backend.main import app

client = TestClient(app)

# --- SINAV VERİSETİ (Ground Truth) ---
CLASSIFICATION_TEST_DATA = [
    {
        "text": "Kullanıcı, sisteme e-posta ve şifresi ile giriş yapabilmelidir.",
        "expected_category_keywords": ["Functional", "Functionality", "FR"]
    },
    {
        "text": "Sistem, herhangi bir arıza durumunda 1 dakika içinde yedek sunucuya geçmelidir.",
        "expected_category_keywords": ["Performance", "Reliability", "NFR", "Non-Functional"]
    },
    {
        "text": "Tüm kullanıcı parolaları veritabanında SHA-256 ile şifrelenerek saklanmalıdır.",
        "expected_category_keywords": ["Security", "NFR", "Non-Functional"]
    }
]

AUDIT_TEST_DATA = [
    {
        "text": "Sistem arayüzü çok güzel ve kullanıcı dostu olmalıdır.",
        "expected_issue_keywords": ["Ambiguous", "Vague", "Testability", "Belirsiz", "Subjective", "Measurable"]
    },
    {
        "text": "Sistem hızlı çalışmalı ve verileri güvenli bir şekilde kaydetmelidir.",
        "expected_issue_keywords": ["Atomicity", "Ambiguous", "Multiple", "Vague", "Split", "Subjective", "Specific", "Measurable"]
    }
]

def test_llm_classification_accuracy():
    """Yapay zekanın gereksinim türlerini doğru sınıflandırıp sınıflandırmadığını test eder."""
    for item in CLASSIFICATION_TEST_DATA:
        time.sleep(5) # Kotayı aşmamak için bekleme süresini artırdık
        response = client.post("/classify", json={"text": item["text"]})
        assert response.status_code == 200
        
        result = response.json()["result"].lower()
        
        # Beklenen anahtar kelimelerden EN AZ BİRİ yapay zekanın cevabında geçmeli
        expected_keywords_lower = [kw.lower() for kw in item["expected_category_keywords"]]
        match_found = any(kw in result for kw in expected_keywords_lower)
        
        assert match_found, f"BAŞARISIZ: '{item['text']}' için beklenen kategoriler {expected_keywords_lower} bulunamadı. Yapay Zeka Cevabı: {result}"

def test_llm_audit_quality():
    """Yapay zekanın kötü yazılmış gereksinimlerdeki hataları bulup bulamadığını test eder."""
    for item in AUDIT_TEST_DATA:
        time.sleep(5) # Kotayı aşmamak için bekleme süresini artırdık
        response = client.post("/analyze", json={"text": item["text"]})
        assert response.status_code == 200
        
        # Analyze endpoint'i liste döner
        results = response.json()["result"]
        
        # Eğer yapay zeka hiçbir hata bulamadıysa test başarısızdır
        assert len(results) > 0, f"BAŞARISIZ: '{item['text']}' için yapay zeka hata bulamadı!"
        
        analysis_text = results[0]["message"].lower()
        
        expected_keywords_lower = [kw.lower() for kw in item["expected_issue_keywords"]]
        match_found = any(kw in analysis_text for kw in expected_keywords_lower)
        
        assert match_found, f"BAŞARISIZ: '{item['text']}' için beklenen eleştiriler {expected_keywords_lower} yapılmadı. Yapay Zeka Eleştirisi: {analysis_text}"
