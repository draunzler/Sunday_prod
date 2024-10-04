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
    template="The following is a conversation with an AI assistant named Sunday. The assistant is helpful, creative, clever, and very friendly.\n\n{history}\nHuman: {input}\nAI:\n\nIf the user requests a chart and only then, provide a table of data at the end of your response that can be used to generate the chart. The table should be formatted clearly with columns and rows. If not asked explicitly for a chart or a table, you DO NOT need to provide a table."
)

memory = ConversationBufferMemory(memory_key="history")

llm_chain = LLMChain(
    llm=google_llm,
    prompt=prompt,
    memory=memory
)

logger.info("chat_service.py is being executed")


llm_memory_contexts = {}

async def generate_response(prompt_request, messages_collection):
    try:
        prompt = prompt_request.prompt
        user_id = prompt_request.user_id
        message_id = prompt_request.message_id

        logger.debug(f"Received prompt: {prompt}")
        logger.debug(f"User ID: {user_id}, Message ID: {message_id}")

        # Retrieve memory context from MongoDB or in-memory context
        if message_id in llm_memory_contexts:
            memory_context = llm_memory_contexts[message_id]
        else:
            message_doc = messages_collection.find_one({"_id": ObjectId(message_id)})
            if not message_doc or "messages" not in message_doc:
                memory_context = []
            else:
                memory_context = message_doc["messages"]

        history = "\n".join([f"User: {m['prompt']}\nBot: {m['response']}" for m in memory_context])
        full_input = f"{history}\nUser: {prompt}" 

        response = llm_chain.predict(input=full_input)

        logger.info(f"Generated response: {response}")

        # Update memory context with the new interaction
        new_interaction = {
            "prompt": prompt,
            "response": response,
            "timestamp": datetime.utcnow().isoformat()  # Convert datetime to string
        }
        memory_context.append(new_interaction)

        update_data = {
            "$push": {
                "messages": new_interaction
            }
        }
        result = messages_collection.update_one(
            {"_id": ObjectId(message_id), "user_id": user_id},
            update_data
        )

        logger.debug(f"Update result: {result.modified_count} documents modified")

        if result.modified_count == 0:
            return JSONResponse({"error": "Message not found or not updated"}, status_code=404)

        return {"bot": response}
    
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
