# app/controllers/chat_controller.py
from bson import ObjectId
from fastapi.responses import JSONResponse
from typing import Optional
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from datetime import datetime

from app.models import Message
from app.services import chat_service

def serialize_message(message):
    """Convert MongoDB message document to a JSON-serializable format."""
    message["_id"] = str(message["_id"])  # Convert ObjectId to string
    return message

async def create_message(message: Message, messages_collection):
    try:
        message_data = {
            "user_id": message.user_id,
            "message_name": message.name,
            "messages": [],
            "created_at": datetime.utcnow().isoformat()
        }

        inserted_id = messages_collection.insert_one(message_data).inserted_id

        return JSONResponse({"message": "Message created successfully", "message_id": str(inserted_id)})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def get_messages(user_id: str, message_id: str, messages_collection):
    try:
        message_id_obj = ObjectId(message_id)

        document = messages_collection.find_one({"user_id": user_id, "_id": message_id_obj})

        if document:
            response = {
                "_id": str(document["_id"]),
                "user_id": str(document["user_id"]),
                "name": document.get("message_name", "Unnamed Message"),
                "messages": document.get("messages", [])
            }
            return JSONResponse(response)
        else:
            return JSONResponse({"error": "Message not found"}, status_code=404)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def generate_response(prompt_request, messages_collection):
    return await chat_service.generate_response(prompt_request, messages_collection)

async def forget_memory():
    return await chat_service.forget_memory()
