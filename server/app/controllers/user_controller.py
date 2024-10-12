from fastapi.responses import JSONResponse
from app.services import user_service
import secrets
from fastapi.responses import JSONResponse

async def create_user(user_data: dict):
    # Generate a unique verification token
    verification_token = secrets.token_urlsafe(32)
    user_data["is_verified"] = False  # Add an "is_verified" flag to the user model
    user_data["verification_token"] = verification_token  # Store the token

    # Create the user in the database
    response = await user_service.create_user(user_data)

    # Send the verification email
    email_response = user_service.send_verification_email(user_data["email"], verification_token)
    
    if "error" in email_response:
        return JSONResponse({"error": "Failed to send verification email"}, status_code=500)

    return response

async def get_user(user_id):
    return await user_service.get_user(user_id)

async def login_user(email, password):
    return await user_service.login_user(email, password)