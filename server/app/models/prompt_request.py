from pydantic import BaseModel

class PromptRequest(BaseModel):
    user_id: str
    message_id: str
    prompt: str
    model: str = "gemini-1.5-pro"