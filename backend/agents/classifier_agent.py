from backend.agents.base_agent import BaseAgent
import json
import os

class ClassifierAgent(BaseAgent):
    def process(self, requirement_text):
        """
        Classify the requirement as Functional (FR) or Non-Functional (NFR).
        """
        # Load examples for few-shot prompting
        rules_path = os.path.join(os.path.dirname(__file__), "..", "data", "rules.json")
        examples_str = ""
        try:
            with open(rules_path, "r") as f:
                rules_data = json.load(f)
                examples = rules_data.get("classification_examples", {})
                fr_ex = "\n".join([f"- FR: {ex}" for ex in examples.get("functional", [])])
                nfr_ex = "\n".join([f"- NFR: {ex}" for ex in examples.get("non_functional", [])])
                examples_str = f"\nEXAMPLES:\n{fr_ex}\n{nfr_ex}\n"
        except Exception as e:
            print(f"Warning: Could not load rules for few-shot prompting: {e}")

        prompt = f"""
        Classify the following software requirement.

        Requirement: "{requirement_text}"

        Categories:
        - Functional Requirement (FR): What the system must do.
        - Non-Functional Requirement (NFR): How the system should perform.

        {examples_str}

        Output ONLY the category name and a 1-sentence justification.
        Format: [Category] - Justification
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error classifying: {str(e)}"
