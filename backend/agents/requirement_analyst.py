import json
import re
from backend.agents.base_agent import BaseAgent
from backend.config import Config
import chromadb
from sentence_transformers import SentenceTransformer

class RequirementAnalyst(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)
        self.embed_model = SentenceTransformer(Config.EMBEDDING_MODEL)
        self.client = chromadb.PersistentClient(path=Config.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="ieee_rules")

    def kural_ekle(self, kural_metni, metadata):
        vektor = self.embed_model.encode(kural_metni).tolist()
        self.collection.add(
            ids=[str(metadata['id'])],
            embeddings=[vektor],
            documents=[kural_metni],
            metadatas=[metadata]
        )

    def process(self, req_id, requirement_text):
        if not requirement_text or not requirement_text.strip():
            return []

        # 1. Metni satırlara böl ve sadece geçerli gereksinimleri (FR-, NFR-) al
        lines = [line.strip() for line in requirement_text.split('\n') if line.strip()]
        # Eğer FR/NFR varsa onları al, yoksa metnin tamamını işleme al (boş kalmasın)
        valid_requirements = [line for line in lines if line.startswith("FR-") or line.startswith("NFR-")]
        if not valid_requirements:
            valid_requirements = lines  # Tüm satırları gönder

        # 2. Bütün gereksinimleri tek bir metin bloğu haline getir (Gemini'ye tek seferde yollamak için)
        reqs_for_prompt = "\n".join([f"- {req}" for req in valid_requirements])

        # 3. Vektör araması (Genel bağlamı yakalamak için tüm metni kullanıyoruz)
        query_vector = self.embed_model.encode(requirement_text).tolist()
        results = self.collection.query(query_embeddings=[query_vector], n_results=3)
        
        if not results['documents'] or not results['documents'][0]:
            related_rules = "No similar rules found."
        else:
            related_rules = "\n".join(results['documents'][0])

        # 4. TEK VE GÜÇLÜ BİR PROMPT (Gemini'ye toplu liste dönmesini emrediyoruz)
    # 4. TEK VE GÜÇLÜ BİR PROMPT (Gemini'ye toplu liste dönmesini emrediyoruz)
        prompt = f"""
        You are an expert software requirement analyst. Analyze the following LIST of requirements based on the provided IEEE rules and SMART criteria.

        Relevant IEEE Rules:
        {related_rules}

        Requirements to Analyze:
        {reqs_for_prompt}

        Task:
        Analyze EACH requirement individually.
        1. Extract the ID (e.g., FR-01). CRITICAL: You MUST include at least one object where "req_id" is EXACTLY "{req_id}".
        2. Check if it complies with SMART criteria.
        
        CRITICAL INSTRUCTIONS:
        1. You MUST return your response ONLY as a valid JSON ARRAY. Do not include markdown wrappers like ```json.
        2. For the "smart_tag", STRICTLY use ONLY a single uppercase letter ('S', 'M', 'A', 'R', or 'T'). DO NOT write full words like 'Specific' or 'Measurable'. If the requirement is perfect and has no errors, leave it empty "".
        
        Format Example:
        [
            {{
                "req_id": "FR-01",
                "smart_tag": "M",
                "message": "The requirement lacks explicit measurable outcomes.",
                "suggestion": "Add specific metrics."
            }},
            {{
                "req_id": "FR-02",
                "smart_tag": "",
                "message": "Requirement meets all criteria.",
                "suggestion": ""
            }}
        ]
        """
        
        # 5. SADECE TEK BİR API ÇAĞRISI (Kota dostu)
        try:
            print(f"DEBUG: Gemini'ye istek gidiyor... req_id: {req_id}")
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Markdown temizleme
            # result_text içindeki ilk [ ve son ] arasını güvenle çeker
            json_match = re.search(r'\[.*\]', result_text, re.DOTALL)
            if json_match:
                result_text = json_match.group(0)

            structured_data = json.loads(result_text)
            
            # Eğer model yanlışlıkla dict dönerse listeye çevir
            if isinstance(structured_data, dict):
                structured_data = [structured_data]
                
            return structured_data

        except Exception as e:
            return [{
                "req_id": req_id,
                "smart_tag": "",
                "message": f"Analiz hatası: Lütfen tekrar deneyin.",
                "suggestion": ""
            }]