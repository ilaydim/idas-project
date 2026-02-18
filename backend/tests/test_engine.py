import sys
import os

# Backend klasörünü yola ekle (test dosyası backend/tests içinde olduğu için 2 seviye yukarı çıkıp backend'i görmeli)
# Ancak biz backend paketini import edeceğimiz için proje kök dizinini eklemeliyiz.
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(PROJECT_ROOT)

try:
    from backend.analysis_engine import IDASAnalizMotoru
    from backend.config import Config
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def main():
    print("Test başlatılıyor...")
    
    # API Key kontrolü
    if not os.getenv("GOOGLE_API_KEY"):
        print("UYARI: GOOGLE_API_KEY çevresel değişkeni bulunamadı.")
        print("Lütfen .env dosyanızı ayarlayın veya terminalde export GOOGLE_API_KEY=... çalıştırın.")
        # Test için fake bir key atayalım veya kullanıcıyı uyaralım
        # os.environ["GOOGLE_API_KEY"] = "fake_key_for_test" 

    try:
        motor = IDASAnalizMotoru()
        print("Motor başarıyla başlatıldı.")
        
        sample_requirement = "Sistem, kullanıcı şifresini veritabanında düz metin olarak saklamalıdır."
        print(f"Örnek Gereksinim: {sample_requirement}")
        
        result = motor.analiz_et(sample_requirement)
        print("-" * 30)
        print("Analiz Sonucu:")
        print(result)
        print("-" * 30)
        
    except Exception as e:
        print(f"Test sırasında hata: {e}")

if __name__ == "__main__":
    main()
