from backend.agents.base_agent import BaseAgent
from backend.agents.requirement_analyst import RequirementAnalyst
from backend.agents.template_agent import TemplateAgent
from backend.agents.glossary_agent import GlossaryAgent
from backend.agents.drafting_agent import DraftingAgent
from backend.agents.classifier_agent import ClassifierAgent
from backend.agents.quality_agent import QualityAgent
from backend.agents.resolution_agent import ResolutionAgent
from backend.agents.chat_agent import ChatAgent
from backend.agents.review_agent import ReviewAgent
from backend.agents.rewrite_agent import RewriteAgent

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
        self.resolution_agent = ResolutionAgent(model_name)
        self.chat_agent = ChatAgent(model_name)
        self.review_agent = ReviewAgent(model_name)
        self.rewrite_agent = RewriteAgent(model_name)

    # DİKKAT: req_id=None parametresini ekledik
    def process(self, input_text, task_type="analyze", req_id=None, **kwargs):
        """
        Route the task to the appropriate agent.
        """
        if task_type == "analyze":
            # req_id gelmezse sistemin çökmemesi için varsayılan bir değer atıyoruz
            _req_id = req_id if req_id else " "
            return self.analyst.process(_req_id, input_text)
            
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
        elif task_type == "resolve":
            return self.resolution_agent.process(input_text)
        elif task_type == "chat":
            return self.chat_agent.process(input_text)
        elif task_type == "review":
            return self.review_agent.process(input_text)
        elif task_type == "rewrite":
            return self.rewrite_agent.process(
                original_text=input_text, 
                issue=kwargs.get("issue", ""), 
                suggestion=kwargs.get("suggestion", "")
            )
        else:
            return "Unknown task type."

    def add_rule(self, rule_text, metadata):
        """
        Delegate rule addition to the analyst agent.
        """
        self.analyst.kural_ekle(rule_text, metadata)