import chromadb
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from backend.config import Config

class IDASAnalizMotoru:
    def __init__(self):
        # 1. Konfigürasyon ve API ayarları
        if not Config.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY bulunamadı! .env dosyasını kontrol edin.")
            
        genai.configure(api_key=Config.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)

        # 2. Hafif embedding modelini yükle (CPU'yu yormaz)
        self.embed_model = SentenceTransformer(Config.EMBEDDING_MODEL)
        
        # 3. Yerel ChromaDB bağlantısı
        self.client = chromadb.PersistentClient(path=Config.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="ieee_rules")

    def kural_ekle(self, kural_metni, metadata):
        # IEEE kurallarını veritabanına ekle
        vektor = self.embed_model.encode(kural_metni).tolist()
        self.collection.add(
            ids=[str(metadata['id'])],
            embeddings=[vektor],
            documents=[kural_metni],
            metadatas=[metadata]
        )

    def analiz_et(self, gereksinim_metni):
        # 1. Yazılan metni vektöre çevir
        sorgu_vektoru = self.embed_model.encode(gereksinim_metni).tolist()
        
        # 2. Benzer IEEE kuralını bul
        sonuclar = self.collection.query(query_embeddings=[sorgu_vektoru], n_results=2)
        
        # Sonuçların boş olup olmadığını kontrol et
        if not sonuclar['documents'] or not sonuclar['documents'][0]:
            ilgili_kurallar = "Herhangi bir benzer kural bulunamadı."
        else:
            ilgili_kurallar = "\n".join(sonuclar['documents'][0])

        # 3. Gemini'ye sor
        prompt = f"""
        Sen uzman bir yazılım gereksinim analistisisin. Aşağıdaki kullanıcı gereksinimini, verilen IEEE kurallarına göre analiz et.

        İlgili IEEE Kuralları (Referans):
        {ilgili_kurallar}

        Kullanıcı Gereksinimi:
        "{gereksinim_metni}"

        Görev:
        1. Bu gereksinim kurallara uygun mu?
        2. Herhangi bir belirsizlik, tutarsızlık veya eksiklik var mı?
        3. Eğer hata varsa, nasıl düzeltilmeli?

        Lütfen kısa, net ve yapıcı bir geri bildirim ver.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Analiz sırasında hata oluştu: {str(e)}"