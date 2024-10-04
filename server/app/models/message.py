# app/models/message.py
from typing import Optional
from pydantic import BaseModel

class Message(BaseModel):
    user_id: str
    message_id: Optional[str] = None
    name: str