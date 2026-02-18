from backend.agents.base_agent import BaseAgent

class QualityAgent(BaseAgent):
    def process(self, requirement_text):
        """
        Audit the requirement using the 'Uncertainty and Quality Checklist'.
        """
        prompt = f"""
        Perform a Quality Audit on this requirement using the 'Uncertainty and Quality Checklist'.

        Requirement: "{requirement_text}"

        Checklist items to verify:
        1. Ambiguity (Is it clear?)
        2. Testability (Can it be tested?)
        3. Completeness (Is information missing?)
        4. Consistency (Does it contradict standard practices?)

        Report ONLY issues found. If it is perfect, say "No quality issues found."
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error auditing: {str(e)}"
