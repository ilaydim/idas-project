from backend.agents.base_agent import BaseAgent

class ResolutionAgent(BaseAgent):
    def process(self, issue_description):
        """
        Suggest a fix for a given software requirement issue.
        """
        prompt = f"""
        You are an expert software requirement analyst. A quality issue has been identified in a requirement.
        
        Issue: "{issue_description}"

        Task:
        1. Explain why this is an issue.
        2. Provide a concrete, technical, and high-quality suggestion to fix this requirement.
        3. The fix should be clear, measurable, and testable.

        Please provide a short and constructive response.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error resolving issue: {str(e)}"
