from .news_summ import get_news
from fastapi import Depends, APIRouter, HTTPException
from .auth import get_current_user
import os
from dotenv import load_dotenv
from fc.newsfetcher import NewsFetcher
import json
import asyncio
from fc.expAi import explain_factcheck_result, generate_visual_explanation
from fc.fact_checker import FactChecker

from pydantic import BaseModel

class UrlInput(BaseModel):
    url: str

class TextInput(BaseModel):
    text: str

load_dotenv()

input_router = APIRouter()

@input_router.post("/get-fc-url")
async def get_fc_url(input_data: UrlInput):
    try:
        news_text = get_news(input_data.url)
      
        if news_text['status'] == 'error':
            return {
                "status": "Unable to fetch the news from the url. Please try a different link",
                "content": None
            }
        
        
        fact_checker = FactChecker(groq_api_key=os.getenv("GROQ_API_KEY"), serper_api_key=os.getenv("SERPER_API_KEY"))
        # Run fact check - it will be run through transformation pipeline
        fact_check_result = fact_checker.generate_report(news_text['text'])
        
        
        explanation = explain_factcheck_result(fact_check_result)

        
        #return an object with fact check result and visualization data, and explanation
        return {
            "status": "success",
            "content": {
                "fact_check_result": fact_check_result,
                "explanation": explanation["explanation"],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@input_router.post("/get-fc-text")
async def get_fc_text(input_data: TextInput):
    try:
        fact_checker = FactChecker(groq_api_key=os.getenv("GROQ_API_KEY"), serper_api_key=os.getenv("SERPER_API_KEY"))
        # Run fact check - it will be run through transformation pipeline
        fact_check_result = fact_checker.generate_report(input_data.text)
        
        
        explanation = explain_factcheck_result(fact_check_result)

        
        #return an object with fact check result and visualization data, and explanation
        return {
            "status": "success",
            "content": {
                "fact_check_result": fact_check_result,
                "explanation": explanation["explanation"],
                
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))