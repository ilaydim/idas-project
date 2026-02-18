from backend.agents.base_agent import BaseAgent
from backend.agents.requirement_analyst import RequirementAnalyst
from backend.agents.template_agent import TemplateAgent
from backend.agents.glossary_agent import GlossaryAgent
from backend.agents.drafting_agent import DraftingAgent
from backend.agents.classifier_agent import ClassifierAgent
from backend.agents.quality_agent import QualityAgent

class Orchestrator(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name)
        # Initialize sub-agents
        self.analyst = RequirementAnalyst(model_name)
        self.template_agent = TemplateAgent(model_name)
        self.glossary_agent = GlossaryAgent(model_name)
        self.drafting_agent = DraftingAgent(model_name)
        self.classifier_agent = ClassifierAgent(model_name)
        self.quality_agent = QualityAgent(model_name)

    def process(self, input_text, task_type="analyze"):
        """
        Route the task to the appropriate agent.
        """
        if task_type == "analyze":
            return self.analyst.process(input_text)
        elif task_type == "check_template":
            # For template check, input_text should be the full content
            return self.template_agent.process(input_text)
        elif task_type == "check_glossary":
            return self.glossary_agent.process(input_text)
        elif task_type == "draft":
            return self.drafting_agent.process(input_text)
        elif task_type == "classify":
            return self.classifier_agent.process(input_text)
        elif task_type == "audit":
            return self.quality_agent.process(input_text)
        else:
            return "Unknown task type."

    def add_rule(self, rule_text, metadata):
        """
        Delegate rule addition to the analyst agent.
        """
        self.analyst.kural_ekle(rule_text, metadata)
