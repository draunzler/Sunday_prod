from app.services import user_service

async def create_user(user_data: dict):
    return await user_service.create_user(user_data)

async def get_user(user_id):
    return await user_service.get_user(user_id)

async def login_user(email, password):
    return await user_service.login_user(email, password)