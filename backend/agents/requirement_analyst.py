from backend.agents.base_agent import BaseAgent
from backend.config import Config
import chromadb
from sentence_transformers import SentenceTransformer

class RequirementAnalyst(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)
        # Initialize embedding model and vector DB
        self.embed_model = SentenceTransformer(Config.EMBEDDING_MODEL)
        self.client = chromadb.PersistentClient(path=Config.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="ieee_rules")

    def kural_ekle(self, kural_metni, metadata):
        """
        Add a new IEEE rule to the knowledge base.
        """
        vektor = self.embed_model.encode(kural_metni).tolist()
        self.collection.add(
            ids=[str(metadata['id'])],
            embeddings=[vektor],
            documents=[kural_metni],
            metadatas=[metadata]
        )

    def process(self, requirement_text):
        """
        Analyze the requirement text against IEEE rules.
        """
        # 1. Vectorize the input
        query_vector = self.embed_model.encode(requirement_text).tolist()
        
        # 2. Retrieve relevant rules
        results = self.collection.query(query_embeddings=[query_vector], n_results=2)
        
        if not results['documents'] or not results['documents'][0]:
            related_rules = "No similar rules found."
        else:
            related_rules = "\n".join(results['documents'][0])

        # 3. Construct the prompt
        prompt = f"""
        You are an expert software requirement analyst. Analyze the following user requirement based on the provided IEEE rules.

        Relevant IEEE Rules (Reference):
        {related_rules}

        User Requirement:
        "{requirement_text}"

        Task:
        1. Is this requirement compliant with the rules?
        2. Are there any ambiguities, inconsistencies, or missing information?
        3. If there are errors, how should they be fixed?

        Please provide short, clear, and constructive feedback.
        """
        
        # 4. Generate response using Gemini
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error during analysis: {str(e)}"
