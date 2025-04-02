from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config
from datetime import datetime, timezone
from passlib.context import CryptContext
import time
from bson import ObjectId
import tracemalloc
import os
import dotenv

dotenv.load_dotenv()

tracemalloc.start()

MONGO_URL = os.getenv("MONGO_URL")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Database:
    client: AsyncIOMotorClient = None
    user_collection = None

    @classmethod
    async def connect_db(self):
        self.client = AsyncIOMotorClient(MONGO_URL)
        self.user_collection = self.client.nexus.users
        await self.user_collection.create_index("email", unique=True)
        await self.user_collection.create_index("username", unique=True)

    @classmethod
    async def close_db(self):
        self.client.close()

    @classmethod
    async def save_user(self, user_data: dict):
        user_data["password"] = pwd_context.hash(user_data["password"])
        user_data["created_at"] = datetime.now(timezone.utc)
        await self.user_collection.insert_one(user_data)

    @classmethod
    async def get_user(self, email: str):
        return await self.user_collection.find_one({"email": email})
    
    @classmethod
    async def get_user_by_username(self, username: str):
        return await self.user_collection.find_one({"username": username})


    @classmethod
    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)
