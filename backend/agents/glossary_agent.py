from backend.agents.base_agent import BaseAgent
from backend.config import Config
import json
import os
import re

class GlossaryAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)
        self.glossary = self._load_glossary()

    def _load_glossary(self):
        try:
            path = os.path.join(Config.BASE_DIR, 'backend', 'data', 'glossary.json')
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('terms', [])
        except Exception as e:
            print(f"Error loading glossary: {e}")
            return []

    def process(self, text):
        """
        Scan the text for terms defined in the glossary that are forbidden or deprecated.
        """
        findings = []
        
        for term_entry in self.glossary:
            term = term_entry['term']
            if term_entry['status'] in ['forbidden', 'deprecated']:
                # Case-insensitive search
                if re.search(r'\b' + re.escape(term) + r'\b', text, re.IGNORECASE):
                    findings.append({
                        "term": term,
                        "status": term_entry['status'],
                        "suggestion": term_entry['suggestion'],
                        "reason": term_entry['reason']
                    })

        if not findings:
            return "No glossary issues found."

        return {
            "status": "Glossary Issues Found",
            "findings": findings
        }
