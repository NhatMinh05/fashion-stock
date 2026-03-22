from fastapi import APIRouter
from models.schemas import PredictionInput, ChatInput
from services.prediction_service import calculate_prediction
from services.ai_service import get_all_products_data, process_chat_message, get_summary_data

# XÓA prefix="/api" Ở ĐÂY VÌ TRONG main.py ĐÃ CÓ RỒI
router = APIRouter()

@router.get("/products")
async def get_products():
    return get_all_products_data()

@router.post("/predict")
async def predict_inventory(data: PredictionInput):
    return calculate_prediction(data)

@router.post("/chat")
async def chat_with_ai(data: ChatInput):
    reply = process_chat_message(data.message)
    return {"reply": reply}

@router.get("/analytics/summary")
async def analytics_summary():
    return get_summary_data()