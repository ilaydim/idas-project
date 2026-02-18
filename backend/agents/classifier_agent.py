from backend.agents.base_agent import BaseAgent

class ClassifierAgent(BaseAgent):
    def process(self, requirement_text):
        """
        Classify the requirement as Functional (FR) or Non-Functional (NFR).
        """
        prompt = f"""
        Classify the following software requirement.

        Requirement: "{requirement_text}"

        Categories:
        - Functional Requirement (FR)
        - Non-Functional Requirement (NFR)

        Output ONLY the category name and a 1-sentence justification.
        Format: [Category] - Justification
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error classifying: {str(e)}"
