from backend.agents.base_agent import BaseAgent

class ChatAgent(BaseAgent):
    def process(self, query):
        """
        Respond to user queries related to software requirements and general asistance.
        """
        prompt = f"""
        You are an expert software requirement assistant named IDAS AI. 
        Your goal is to help users author high-quality software requirements, 
        explain quality rules (like IEEE standards), and provide general technical assistance.

        User Inquiry: "{query}"

        Instructions:
        1. Be professional, helpful, and concise.
        2. If the user asks about something unrelated to software engineering or requirements, 
           politely guide them back to the topic.
        3. Provide actionable advice whenever possible.
        4. CRITICAL: Always respond in English, regardless of the language the user speaks.

        Please provide a natural and helpful response.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                return "The AI service is currently busy or has reached its quota limit. Please wait about a minute and try again."
            return f"Error in chat processing: {error_msg}"
