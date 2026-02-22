from backend.agents.base_agent import BaseAgent
import json
import re

class ReviewAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)

    def process(self, input_text):
        prompt = f"""
        Analyze the following software requirement document content. 
        Your task is to:
        1. Extract individual requirements from the text.
        2. For each requirement, determine its type: 'FR' (Functional) or 'NFR' (Non-Functional).
        3. Analyze the quality of each requirement based on IEEE/ISO standards.
        4. Provide a status: 'success' (no issues), 'warning' (minor issues), or 'error' (critical issues).
        5. Identify the specific issue if any.
        6. Provide a concrete suggestion for improvement.

        Return ONLY a JSON object with the following structure:
        {{
            "stats": {{
                "total": total_count,
                "fr": fr_count,
                "nfr": nfr_count,
                "issues": issues_count
            }},
            "requirements": [
                {{
                    "id": "REQ-001",
                    "type": "FR",
                    "text": "original requirement text",
                    "status": "warning/error/success",
                    "issue": "description of issue or null",
                    "suggestion": "suggestion or null"
                }},
                ...
            ]
        }}

        Document Content:
        {input_text}
        """
        try:
            response = self.model.generate_content(prompt)
            if not response or not response.text:
                return {"error": "AI returned an empty response."}
            
            # Clean response text to ensure it's valid JSON
            # More robust JSON regex
            json_match = re.search(r'(\{.*\})', response.text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError as e:
                    return {
                        "error": f"JSON Decode Error: {str(e)}",
                        "raw": response.text[:500] + "..." if len(response.text) > 500 else response.text
                    }
            else:
                return {
                    "error": "No JSON found in AI response.",
                    "raw": response.text[:500] + "..." if len(response.text) > 500 else response.text
                }
        except Exception as e:
            return {"error": f"AI Generation Error: {str(e)}"}
