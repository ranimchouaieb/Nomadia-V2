import os
import joblib
import traceback
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
API_KEY = os.environ.get("API_KEY")

# Chargement du modèle ML (la boussole)
try:
    intent_model = joblib.load('backend/intent_model.joblib')
    print("✅ Modèle ML chargé.")
except:
    intent_model = None
    print("⚠️ Modèle ML non trouvé. Lance train_model.py !")

# creation Client Gemini
client = None
if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception as e:
        print(f"❌ Erreur Gemini: {e}")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Base RAG ("Livre")
KNOWLEDGE_BASE = [
    {"id": "food", "category": "food", "keywords": ["manger", "couscous", "brik"], "content": "La cuisine tunisienne : Couscous, Brik, Lablabi.", "images": ["public/couscous-viande_0.jpg"]},
    {"id": "sidi_bou", "category": "geography", "keywords": ["sidi bou said", "bleu"], "content": "Sidi Bou Saïd, le village bleu et blanc.", "images": ["https://images.unsplash.com/photo-1566903253360-1283d5a80b15?w=600"], "coordinates": "36.8703, 10.3421"},
    {"id": "carthage", "category": "history", "keywords": ["carthage", "hannibal"], "content": "Carthage antique, fondée en 814 av JC.", "images": ["https://images.unsplash.com/photo-1669049488330-9759392e2124?w=600"], "coordinates": "36.8525, 10.3238"},
    {"id": "sahara", "category": "geography", "keywords": ["sahara", "douz"], "content": "Le grand désert du Sahara au sud.", "images": ["https://images.unsplash.com/photo-1542052683-9b63a948480d?w=600"], "coordinates": "33.4667, 9.0167"}
]

#cerveau du rag 
def retrieve_context(query):
    # 1. Classification ML
    category = "general"
    if intent_model:
        category = intent_model.predict([query])[0]
        print(f"🤖 IA Classification: {category.upper()}")
    
    # 2. Filtrage RAG
    results = []
    for item in KNOWLEDGE_BASE:
        # On garde si c'est la bonne catégorie OU si on trouve un mot clé exact
        #Il récupère toutes les fiches dont :la catégorie correspond OU un mot-clé apparaît dans la phrase

        if category == "general" or item.get("category") == category or any(k in query.lower() for k in item["keywords"]):
            info = f"SUJET: {item['id']}\nINFO: {item['content']}"
            if "images" in item: info += f"\nIMAGES: {', '.join(item['images'])}"
            if "coordinates" in item: info += f"\nGPS: {item['coordinates']}"
            results.append(info)
            
    return "\n---\n".join(results)

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    language: str

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    if not client: raise HTTPException(500, "API Key manquante")
    
    context = retrieve_context(req.message)
    sys_prompt = f"Tu es Nomadia. Contexte: {context}. Affiche images comme ![alt](url) et cartes comme [MAP: lat, lng]."
    
    # Conversion format API
    contents = [{"role": "user" if m['role'] == "user" else "model", "parts": [{"text": m['text']}]} for m in req.history]
    contents.append({"role": "user", "parts": [{"text": req.message}]})

    async def generate():
        try:
            stream = client.models.generate_content_stream(model="gemini-2.5-flash", contents=contents, config=types.GenerateContentConfig(system_instruction=sys_prompt))
            for chunk in stream:
                if chunk.text: yield chunk.text
        except Exception as e:
            traceback.print_exc()
            yield str(e)

    return StreamingResponse(generate(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)