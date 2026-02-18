from backend.agents.base_agent import BaseAgent

class DraftingAgent(BaseAgent):
    def process(self, context_text):
        """
        Generate draft requirement sentences based on the provided context.
        """
        prompt = f"""
        You are an expert Requirements Engineer using the HAVELSAN style guide.
        
        Context/Topic:
        "{context_text}"
        
        Task:
        Draft 3 clear, testable, and unambiguous requirement sentences related to the context above.
        Format them as a numbered list.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error creating draft: {str(e)}"
