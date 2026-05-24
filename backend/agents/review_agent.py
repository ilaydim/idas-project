from backend.agents.base_agent import BaseAgent
import json
import re
import os

class ReviewAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)

    def _repair_json(self, json_str):
        """Attempt to repair common JSON issues from AI responses."""
        s = json_str.strip()
        
        # Remove trailing commas before } or ]
        s = re.sub(r',\s*([}\]])', r'\1', s)
        
        # Remove any trailing "..." or ellipsis the AI may have added
        s = re.sub(r',?\s*\.{3}\s*([}\]])', r'\1', s)
        
        # Try parsing as-is after basic cleanup
        try:
            return json.loads(s)
        except json.JSONDecodeError:
            pass
        
        # If JSON is truncated, try to close open brackets/braces
        open_braces = s.count('{') - s.count('}')
        open_brackets = s.count('[') - s.count(']')
        
        if open_braces > 0 or open_brackets > 0:
            # Remove any trailing incomplete key-value pair or object
            # e.g., trailing `"key": "val` without closing quote
            s = re.sub(r',\s*"[^"]*"?\s*:?\s*"?[^"]*$', '', s)
            s = re.sub(r',\s*\{[^}]*$', '', s)  # remove trailing incomplete object
            s = s.rstrip().rstrip(',')
            s += ']' * open_brackets + '}' * open_braces
            
            # Clean trailing commas again after repair
            s = re.sub(r',\s*([}\]])', r'\1', s)
            
            try:
                return json.loads(s)
            except json.JSONDecodeError:
                pass
        
        return None

    def process(self, input_text):
        # Load examples for few-shot prompting
        rules_path = os.path.join(os.path.dirname(__file__), "..", "data", "rules.json")
        examples_str = ""
        try:
            with open(rules_path, "r") as f:
                rules_data = json.load(f)
                examples = rules_data.get("classification_examples", {})
                fr_ex = "\n".join([f"- FR: {ex}" for ex in examples.get("functional", [])])
                nfr_ex = "\n".join([f"- NFR: {ex}" for ex in examples.get("non_functional", [])])
                examples_str = f"\nEXAMPLES FOR CLASSIFICATION:\n{fr_ex}\n{nfr_ex}\n"
        except Exception as e:
            print(f"Warning: Could not load rules for few-shot prompting: {e}")

        prompt = f"""
        Analyze the following software requirement document content. 
        Your task is to:
        1. Extract individual requirements from the text.
        2. For each requirement, determine its type: 'FR' (Functional) or 'NFR' (Non-Functional).
           - Use 'FR' for what the system MUST DO (behaviors, data processing, user actions).
           - Use 'NFR' for how WELL the system must do it (performance, security, usability, constraints).
        
        {examples_str}

        3. Analyze the quality of each requirement based on IEEE/ISO standards.
        4. Provide a status: 'success' (no issues), 'warning' (minor issues), or 'error' (critical issues).
        5. Identify the specific issue if any.
        6. Provide a concrete suggestion for improvement.
        
        CRITICAL MULTILINGUAL INSTRUCTION:
        Regardless of the language the original document is written in (e.g., Turkish, Spanish), you MUST translate every extracted requirement into English and output ONLY English text for the requirement "text", the "issue", and the "suggestion" fields. The entire JSON array must be completely in English.

        IMPORTANT: Make sure your response is COMPLETE and VALID JSON. Do not truncate the output.

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
                }}
            ]
        }}

        Document Content:
        {input_text}
        """
        try:
            response = self.model.generate_content(prompt)
            if not response or not response.text:
                return {"error": "AI returned an empty response."}
            
            # Extract JSON from response
            json_match = re.search(r'(\{.*\})', response.text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                
                # First try: direct parse
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
                
                # Second try: repair and parse
                repaired = self._repair_json(json_str)
                if repaired:
                    return repaired
                
                # Third try: use the full response text for repair
                repaired_full = self._repair_json(response.text)
                if repaired_full:
                    return repaired_full
                
                return {
                    "error": "AI returned malformed JSON. Please try again with a smaller document or retry.",
                    "raw": response.text[:500] + "..." if len(response.text) > 500 else response.text
                }
            else:
                return {
                    "error": "No JSON found in AI response.",
                    "raw": response.text[:500] + "..." if len(response.text) > 500 else response.text
                }
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                return {"error": "The AI service is currently busy or has reached its quota limit. Please wait about a minute and try again."}
            return {"error": f"AI Generation Error: {error_msg}"}
