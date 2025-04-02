import google.generativeai as genai
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def setup_gemini():
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-pro')
    return model

def analyze_content_gemini(model, text):
    prompt = f"""Analyze this news text and return a JSON object with the following structure:
    {{
        "gemini_analysis": {{
            "predicted_classification": "Real or Fake",
            "confidence_score": "0-100",
            "reasoning": ["point1", "point2"]
        }},
        "text_classification": {{
            "category": "",
            "writing_style": "Formal/Informal/Clickbait",
            "target_audience": "",
            "content_type": "news/opinion/editorial"
        }},
        "sentiment_analysis": {{
            "primary_emotion": "",
            "emotional_intensity": "1-10",
            "sensationalism_level": "High/Medium/Low",
            "bias_indicators": ["bias1", "bias2"],
            "tone": {{"formality": "formal/informal", "style": "Professional/Emotional/Neutral"}},
            "emotional_triggers": ["trigger1", "trigger2"]
        }},
        "fact_checking": {{
            "verifiable_claims": ["claim1", "claim2"],
            "evidence_present": "Yes/No",
            "fact_check_score": "0-100"
        }}
    }}

    Analyze this text and return only the JSON response: {text}"""
    
    response = model.generate_content(prompt)
    try:
        cleaned_text = response.text.strip()
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:-3]
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return {
            "gemini_analysis": {
                "predicted_classification": "UNCERTAIN",
                "confidence_score": "50",
                "reasoning": ["Analysis failed to generate valid JSON"]
            }
        }

def get_gemini_analysis(text):
    gemini_model = setup_gemini()
    gemini_analysis = analyze_content_gemini(gemini_model, text)
    return gemini_analysis
