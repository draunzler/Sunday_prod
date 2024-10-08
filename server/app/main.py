from fastapi import FastAPI, HTTPException, Request, APIRouter, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from app.models import Message, PromptRequest, User, LoginRequest, GetMessagesRequest
import logging

from app.controllers import chat_controller, user_controller

app = FastAPI()

load_dotenv()
db_pass = os.getenv('DB_PASSWORD')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
logging.getLogger("pymongo").setLevel(logging.WARNING)
client = MongoClient(f"mongodb+srv://draunzler:{db_pass}@cluster0.bszcu.mongodb.net/")
db = client["test"]
messages_collection = db["messages"]

@app.post("/api/messages/create")
async def create_message(message: Message):
    return await chat_controller.create_message(message, messages_collection)

@app.post("/api/messages/get")
async def get_messages(request: GetMessagesRequest):
    return await chat_controller.get_messages(request, messages_collection)

@app.get("/")
def read_root():
    return {"message": "Hello from Sunday"}

@app.post("/")
async def generate_response(prompt_request: PromptRequest):
    return await chat_controller.generate_response(prompt_request, messages_collection)

@app.post("/forget")
async def forget_memory():
    return await chat_controller.forget_memory()

@app.post("/api/users/create")
async def create_user(user_data: User):
    return await user_controller.create_user(user_data.dict())

@app.post("/api/users/login")
async def login_user(login_request: LoginRequest):
    return await user_controller.login_user(login_request.email, login_request.password)

@app.get("/api/users/get/{user_id}")
async def get_user(user_id: str):
    return await user_controller.get_user(user_id)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)