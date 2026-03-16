from backend.agents.base_agent import BaseAgent

class RewriteAgent(BaseAgent):
    def process(self, original_text, issue, suggestion):
        """
        Intelligently rewrite a requirement in English given its issue and suggestion.
        """
        prompt = f"""
        You are an expert requirement engineer. 
        Please rewrite the following software requirement to fix the identified issue and incorporate the suggestion.
        
        Original Requirement: "{original_text}"
        Identified Issue: "{issue}"
        Guidance/Suggestion: "{suggestion}"

        CRITICAL INSTRUCTIONS:
        1. Output ONLY the rewritten requirement string. Do not include quotes, explanations, or introductory text like "Here is the rewritten requirement".
        2. The rewritten requirement MUST be in English.
        3. Make it clear, testable, and compliant with IEEE software engineering standards.
        4. Do NOT capitalize the word "shall" as "SHALL" in the middle of sentences. Use lowercase "shall".

        Rewritten Requirement:
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip().strip('"').strip("'")
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                return "Error rewriting requirement: The AI service is currently busy or has reached its quota limit. Please wait about a minute and try again."
            return f"Error rewriting requirement: {error_msg}"
