# app/models/user.py
from typing import List, Optional
from pydantic import BaseModel
from .message import Message

class User(BaseModel):
    name: str
    email: str
    password: Optional[str]
    messages: Optional[List[Message]] = []

class LoginRequest(BaseModel):
    email: str
    password: str