from abc import ABC, abstractmethod
from backend.core.llm_manager import LLMManager
from backend.config import Config

class BaseAgent(ABC):
    def __init__(self, model_name=None):
        self.model_name = model_name or Config.GEMINI_MODEL
        self.llm_manager = LLMManager()
        self.model = self.llm_manager.get_model(self.model_name)

    @abstractmethod
    def process(self, *args, **kwargs):
        """
        Process the input and return the result.
        Must be implemented by subclasses.
        """
        pass

