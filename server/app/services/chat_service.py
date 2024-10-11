# app/services/chat_service.py
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from datetime import datetime

from dotenv import load_dotenv
from openai import OpenAI
from fastapi.encoders import jsonable_encoder
import google.generativeai as genai
import openai
import os
import logging
from langchain.chains import LLMChain
from langchain_google_genai import GoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

client = OpenAI(
  organization = os.getenv('ORGANISATION_ID'),
  project = os.getenv('PROJECT_ID'),
)

# Initialize OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')

genai_api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
gemini_model = genai.GenerativeModel('gemini-1.5-pro')
google_llm = GoogleGenerativeAI(api_key=genai_api_key, model="gemini-1.5-pro")

prompt = PromptTemplate(
    input_variables=["history", "input"],
    template=(
        "You are an AI assistant named Sunday, designed to be helpful, creative, and clever. "
        "Your purpose is to assist users by providing informative, engaging, and thoughtful responses "
        "to their questions and requests.\n\n"
        "When responding, always keep the following guidelines in mind:\n"
        "1. Clarity: Provide clear and concise information.\n"
        "2. Creativity: Offer innovative suggestions and solutions.\n"
        "Use the conversation history below to understand the context and flow of the conversation.\n\n"
        "{history}\n\n"
        "User: {input}\n"
        "Your response:"
    )
)

memory = ConversationBufferMemory(memory_key="history")

llm_chain = LLMChain(
    llm=google_llm,
    prompt=prompt,
    memory=memory
)

logger.info("chat_service.py is being executed")

async def generate_response(prompt_request, messages_collection):
    try:
        prompt = prompt_request.prompt
        user_id = prompt_request.user_id
        message_id = prompt_request.message_id
        page = prompt_request.page if 'page' in prompt_request else 1
        limit = 10
        context_limit = 5

        logger.debug(f"Received prompt: {prompt}")
        logger.debug(f"User ID: {user_id}, Message ID: {message_id}, Page: {page}, Limit: {limit}")

        # Retrieve memory context if message_id is provided
        if not message_id:
            memory_context = []
        else:
            message_doc = messages_collection.find_one({"_id": ObjectId(message_id)})
            if not message_doc or "messages" not in message_doc:
                memory_context = []
            else:
                total_messages = len(message_doc["messages"])
                memory_context = message_doc["messages"][-context_limit:]

        # Combine context with current user prompt
        history = "\n".join([f"User: {m['prompt']}\nBot: {m['response']}" for m in memory_context])
        full_input = f"{history}\nUser: {prompt}"

        # Generate the response from LLM chain
        response = llm_chain.predict(input=full_input)
        logger.info(f"Generated response: {response}")

        # Add the current interaction to memory
        new_interaction = {
            "prompt": prompt,
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        }

        memory_context.append(new_interaction)
        memory_context = memory_context[-context_limit:]  # Keep only the last N messages

        # Update the messages collection if message_id exists
        if message_id:
            update_data = {
                "$set": {
                    "messages": memory_context
                }
            }
            result = messages_collection.update_one(
                {"_id": ObjectId(message_id), "user_id": user_id},
                update_data
            )

            logger.debug(f"Update result: {result.modified_count} documents modified")

            if result.modified_count == 0:
                return JSONResponse({"error": "Message not found or not updated"}, status_code=404)

        # Clear memory_context after updating and before returning
        cleared_context = []  # Resetting the memory context to empty
        logger.debug("Memory context cleared.")

        return {
            "bot": response,
            "total_messages": len(total_messages) if message_id else 0,
            "current_page": page,
            "limit": limit
        }

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong")
    
async def forget_memory():
  try:
    memory.clear()

    return {"message": "Memory cleared successfully"}
  except Exception as e:
    logger.error(f"Error clearing memory: {e}")
    raise HTTPException(status_code=500, detail="Something went wrong")