from backend.agents.base_agent import BaseAgent
from backend.config import Config
import json
import os

class TemplateAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)
        self.templates = self._load_templates()

    def _load_templates(self):
        try:
            path = os.path.join(Config.BASE_DIR, 'backend', 'data', 'templates.json')
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('templates', [])
        except Exception as e:
            print(f"Error loading templates: {e}")
            return []

    def process(self, content, template_name="Software Requirement Specification (SRS)"):
        """
        Check if the content contains the required sections of the specified template.
        NOTE: This is a simple string matching check. A more advanced version would use LLM or regex.
        """
        target_template = next((t for t in self.templates if t['name'] == template_name), None)
        if not target_template:
            return f"Template '{template_name}' not found."

        missing_sections = []
        for section in target_template['sections']:
            if section not in content:
                missing_sections.append(section)

        if not missing_sections:
            return "All sections present."
        
        return {
            "status": "Missing Sections Found",
            "missing_sections": missing_sections,
            "checked_against": template_name
        }
