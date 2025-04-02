from fastapi import Depends, APIRouter
from db.init_db import Database
from bson import ObjectId
import os
import dotenv
from pydantic import BaseModel
from .auth import get_current_user
import json
from factcheck import FactCheck

dotenv.load_dotenv()

fax_router = APIRouter()
factchecker = FactCheck()

def factchecking(text):
    result = factchecker.check_text(text)
    return result

@fax_router.post("/factcheck")
async def factcheck_text(text: str, current_user: dict = Depends(get_current_user)):
    result = await factchecking(text)
    return {"result": result}