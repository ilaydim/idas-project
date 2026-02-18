import sys
import os

# Backend modülünü bulabilmek için yolu ayarla
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(PROJECT_ROOT)

try:
    from backend.core.orchestrator import Orchestrator
    from backend.config import Config
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def main():
    print("Agent Test Başlatılıyor...")
    print(f"Model: {Config.GEMINI_MODEL}")

    try:
        orchestrator = Orchestrator()
        print("Orchestrator ajanı başlatıldı.")
        
        sample_requirement = "Sistem, kullanıcı şifresini düz metin olarak saklamalıdır."
        print(f"Girdi: {sample_requirement}")
        
        result = orchestrator.process(sample_requirement, task_type="analyze")
        
        print("-" * 30)
        print("Agent Çıktısı:")
        print(result)
        print("-" * 30)
        
    except Exception as e:
        print(f"Hata oluştu: {e}")

if __name__ == "__main__":
    main()
