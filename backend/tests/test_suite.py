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
    print("Full Agent Suite Test Başlatılıyor...")
    print(f"Model: {Config.GEMINI_MODEL}")
    
    orchestrator = Orchestrator()
    print("Orchestrator başlatıldı.")

    # 1. Template Check
    print("\n--- 1. Template Agent Test ---")
    template_content = "1. Introduction\n2. Overall Description"
    print(f"Input: {template_content}")
    res = orchestrator.process(template_content, task_type="check_template")
    print(f"Result: {res}")

    # 2. Glossary Check
    print("\n--- 2. Glossary Agent Test ---")
    glossary_content = " The Master node needs to whitelist the IP."
    print(f"Input: {glossary_content}")
    res = orchestrator.process(glossary_content, task_type="check_glossary")
    print(f"Result: {res}")

    # 3. Drafting (LLM)
    print("\n--- 3. Drafting Agent Test ---")
    draft_context = "Login security system with 2FA"
    print(f"Input: {draft_context}")
    # res = orchestrator.process(draft_context, task_type="draft")
    # print(f"Result: {res}") 
    print("SKIPPED to save quota")

    # 4. Classifier (LLM)
    print("\n--- 4. Classifier Agent Test ---")
    classify_input = "The system shall respond within 2 seconds."
    print(f"Input: {classify_input}")
    # res = orchestrator.process(classify_input, task_type="classify")
    # print(f"Result: {res}")
    print("SKIPPED to save quota")

    # 5. Quality Audit (LLM)
    print("\n--- 5. Quality Audit Agent Test ---")
    audit_input = "The system should be fast and user friendly."
    print(f"Input: {audit_input}")
    # res = orchestrator.process(audit_input, task_type="audit")
    # print(f"Result: {res}")
    print("SKIPPED to save quota")

if __name__ == "__main__":
    main()
