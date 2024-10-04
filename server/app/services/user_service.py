import logging
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

from app.models import User

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
db_pass = os.getenv('DB_PASSWORD')

# MongoDB connection
client = MongoClient(f"mongodb+srv://draunzler:{db_pass}@cluster0.bszcu.mongodb.net/<database>?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true")
db = client["test"]
users_collection = db["users"]
messages_collection = db["messages"]

async def create_user(user_data):
    try:
        # Hash the password
        hashed_password = bcrypt.hashpw(user_data["password"].encode('utf-8'), bcrypt.gensalt())
        user_data["password"] = hashed_password.decode('utf-8')  # Store the hashed password
        
        user = User(**user_data)
        user_data = user.dict()

        # Insert user into MongoDB
        inserted_id = users_collection.insert_one(user_data).inserted_id

        return JSONResponse({"message": "User created successfully", "user_id": str(inserted_id)})

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

async def login_user(email: str, password: str):
    try:
        # Find the user by email
        user = users_collection.find_one({"email": email})

        if user is None:
            return JSONResponse({"error": "User not found"}, status_code=404)

        # Validate the password
        if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return JSONResponse({"message": "Login successful", "user_id": str(user["_id"])})
        else:
            return JSONResponse({"error": "Invalid password"}, status_code=401)

    except Exception as e:
        logger.error(f"Error during login: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

async def get_user(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        
        if not user:
            return JSONResponse({"error": "User not found"}, status_code=404)

        user_messages = messages_collection.find({"user_id": user_id})

        messages_list = []
        for msg in user_messages:
            messages_list.append({
                "_id": str(msg["_id"]),
                "message_name": msg.get("message_name", ""),
                "created": msg.get("created_at", "")
            })

        # Create the response without the password, adding messages
        user_response = {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "messages": messages_list
        }

        return JSONResponse(user_response)
    
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)