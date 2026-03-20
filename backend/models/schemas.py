# models/schemas.py
from pydantic import BaseModel

class PredictionInput(BaseModel):
    price: float
    month: int
    current_stock: int
    weekly_vel_base: float
    lead_time: int
    complexity_val: int 
    event_count: int
    is_discount_val: int
    store_scale: int

class ChatInput(BaseModel):
    message: str