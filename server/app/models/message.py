# app/models/message.py
from typing import Optional
from pydantic import BaseModel

class Message(BaseModel):
    user_id: str
    message_id: Optional[str] = None
    name: str

class GetMessagesRequest(BaseModel):
    user_id: str
    message_id: str
    page: Optional[int] = 1
    limit: Optional[int] = 10