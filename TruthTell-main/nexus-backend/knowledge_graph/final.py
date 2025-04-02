import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import networkx as nx
import spacy
import pickle
import pandas as pd
import google.generativeai as genai
import json

# Load spaCy for NER
nlp = spacy.load("en_core_web_sm")

# Load the trained ML model
model_path = "./results/checkpoint-5030"  # Replace with the actual path to your model
tokenizer = AutoTokenizer.from_pretrained('microsoft/deberta-v3-small')
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

#########################
def setup_gemini():
    genai.configure(api_key='AIzaSyAQzWpSyWyYCM1G5f-G0ulRCQkXuY7admA')
    model = genai.GenerativeModel('gemini-pro')
    return model
#########################

# Load the knowledge graph
graph_path = "./models/knowledge_graph.pkl"  # Replace with the actual path to your knowledge graph
with open(graph_path, 'rb') as f:
    graph_data = pickle.load(f)

knowledge_graph = nx.DiGraph()
knowledge_graph.add_nodes_from(graph_data['nodes'].items())
for u, edges in graph_data['edges'].items():
    for v, data in edges.items():
        knowledge_graph.add_edge(u, v, **data)

def predict_with_model(text):
    """Predict whether the news is real or fake using the ML model."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_label = torch.argmax(probabilities, dim=-1).item()
    return "FAKE" if predicted_label == 1 else "REAL"

def update_knowledge_graph(text, is_real):
    """Update the knowledge graph with the new article."""
    entities = extract_entities(text)
    for entity, entity_type in entities:
        if not knowledge_graph.has_node(entity):
            knowledge_graph.add_node(
                entity,
                type=entity_type,
                real_count=1 if is_real else 0,
                fake_count=0 if is_real else 1
            )
        else:
            if is_real:
                knowledge_graph.nodes[entity]['real_count'] += 1
            else:
                knowledge_graph.nodes[entity]['fake_count'] += 1

    for i, (entity1, _) in enumerate(entities):
        for entity2, _ in entities[i+1:]:
            if not knowledge_graph.has_edge(entity1, entity2):
                knowledge_graph.add_edge(
                    entity1,
                    entity2,
                    weight=1,
                    is_real=is_real
                )
            else:
                knowledge_graph[entity1][entity2]['weight'] += 1

def extract_entities(text):
    """Extract named entities from text using spaCy."""
    doc = nlp(text)
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    return entities

def predict_with_knowledge_graph(text):
    """Predict whether the news is real or fake using the knowledge graph."""
    entities = extract_entities(text)
    real_score = 0
    fake_score = 0

    for entity, _ in entities:
        if knowledge_graph.has_node(entity):
            real_count = knowledge_graph.nodes[entity].get('real_count', 0)
            fake_count = knowledge_graph.nodes[entity].get('fake_count', 0)
            total = real_count + fake_count
            if total > 0:
                real_score += real_count / total
                fake_score += fake_count / total

    if real_score > fake_score:
        return "REAL"
    else:
        return "FAKE"

def predict_news(text):
    """Predict whether the news is real or fake using both the ML model and the knowledge graph."""
    # Predict with the ML model
    ml_prediction = predict_with_model(text)
    is_real = ml_prediction == "REAL"

    # Update the knowledge graph
    update_knowledge_graph(text, is_real)

    # Predict with the knowledge graph
    kg_prediction = predict_with_knowledge_graph(text)

    # Combine predictions (for simplicity, we use the ML model's prediction here)
    # You can enhance this by combining the scores from both predictions
    return ml_prediction if ml_prediction == kg_prediction else "UNCERTAIN"

#########################
# def analyze_content_gemini(model, text):
#     prompt = f"""Analyze this news text and provide results in the following JSON-like format:

#     TEXT: {text}

#     Please provide analysis in these specific sections:

#     1. GEMINI ANALYSIS:
#        - Predicted Classification: [Real/Fake]
#        - Confidence Score: [0-100%]
#        - Reasoning: [Key points for classification]

#     2. TEXT CLASSIFICATION:
#         - Content category/topic
#         - Writing style: [Formal/Informal/Clickbait]
#         - Target audience
#         - Content type: [news/opinion/editorial]

#     3. SENTIMENT ANALYSIS:
#        - Primary emotion
#        - Emotional intensity (1-10)
#        - Sensationalism Level: [High/Medium/Low]
#        - Bias Indicators: [List if any]
#        - Tone: (formal/informal), [Professional/Emotional/Neutral]
#        - Key emotional triggers

#     4. ENTITY RECOGNITION:
#         - Source Credibility: [High/Medium/Low]
#        - People mentioned
#        - Organizations
#        - Locations
#        - Dates/Time references
#        - Key numbers/statistics

#     5. CONTEXT EXTRACTION:
#        - Main narrative/story
#        - Supporting elements
#        - Key claims
#        - Narrative structure

#     6. FACT CHECKING:
#        - Verifiable Claims: [List main claims]
#        - Evidence Present: [Yes/No]
#        - Fact Check Score: [0-100%]

#     Format the response clearly with distinct sections."""
    
#     response = model.generate_content(prompt)
#     return response.text

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
        "entity_recognition": {{
            "source_credibility": "High/Medium/Low",
            "people": ["person1", "person2"],
            "organizations": ["org1", "org2"],
            "locations": ["location1", "location2"],
            "dates": ["date1", "date2"],
            "statistics": ["stat1", "stat2"]
        }},
        "context": {{
            "main_narrative": "",
            "supporting_elements": ["element1", "element2"],
            "key_claims": ["claim1", "claim2"],
            "narrative_structure": ""
        }},
        "fact_checking": {{
            "verifiable_claims": ["claim1", "claim2"],
            "evidence_present": "Yes/No",
            "fact_check_score": "0-100"
        }}
    }}

    Analyze this text and return only the JSON response: {text}"""
    
    response = model.generate_content(prompt)
    # return json.loads(response.text)
    # Add error handling and response cleaning
    try:
        # Clean the response text to ensure it's valid JSON
        cleaned_text = response.text.strip()
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:-3]  # Remove ```json and ``` markers
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        # Return a default structured response if JSON parsing fails
        return {
            "gemini_analysis": {
                "predicted_classification": "UNCERTAIN",
                "confidence_score": "50",
                "reasoning": ["Analysis failed to generate valid JSON"]
            }
        }


def clean_gemini_output(text):
    """Remove markdown formatting from Gemini output"""
    text = text.replace('##', '')
    text = text.replace('**', '')
    return text

def get_gemini_analysis(text):
    """Get detailed content analysis from Gemini."""
    gemini_model = setup_gemini()
    gemini_analysis = analyze_content_gemini(gemini_model, text)
    # cleaned_analysis = clean_gemini_output(gemini_analysis)
    # return cleaned_analysis
    return gemini_analysis
#########################

def main():
    #print("Welcome to the News Classifier!")
    #print("Enter your news text below. Type 'Exit' to quit.")
    
    while True:
        news_text = input("\nEnter news text: ")
        
        if news_text.lower() == 'exit':
            #print("Thank you for using the News Classifier!")
            return
            
        # First get ML and Knowledge Graph prediction
        prediction = predict_news(news_text)
        #print(f"\nML and Knowledge Graph Analysis: {prediction}")
        
        # Then get Gemini analysis
        #print("\n=== Detailed Gemini Analysis ===")
        gemini_result = get_gemini_analysis(news_text)
        #print(gemini_result)


if __name__ == "__main__":
    main()
