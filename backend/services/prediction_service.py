import pandas as pd
import joblib
from models.schemas import PredictionInput
from core.config import settings

# Load model 1 lần duy nhất khi khởi động server
try:
    model_1_demand = joblib.load(settings.MODEL_DEMAND_PATH)
    model_2_inventory = joblib.load(settings.MODEL_INVENTORY_PATH)
    print(" Đã tải AI Models dự báo thành công!")
except Exception as e:
    print(f" Lỗi tải model: {e}")
    model_1_demand, model_2_inventory = None, None

def calculate_prediction(data: PredictionInput) -> dict:
    # 1. TÍNH NHU CẦU (DEMAND)
    in1 = pd.DataFrame([[data.price, data.complexity_val, data.weekly_vel_base, data.month, data.event_count, data.is_discount_val]], 
                       columns=['price_mean', 'complexity_status_num', 'weekly_velocity', 'month', 'event_sales_count', 'is_discounted'])
    
    raw_ai_demand = max(0, model_1_demand.predict(in1)[0]) if model_1_demand else (data.weekly_vel_base * 4)
    boost_factor = 1.0 + (data.event_count * 0.05) + (data.is_discount_val * 0.15)
    logical_min_demand = (data.weekly_vel_base * 4) * boost_factor
    base_demand = max(raw_ai_demand, logical_min_demand)
    
    # 2. TÍNH TỒN KHO AN TOÀN (INVENTORY)
    holding_cost = data.price * 0.0125
    in2 = pd.DataFrame([[data.price, data.lead_time, holding_cost, data.complexity_val, 0, base_demand/4]],
                       columns=['price', 'Lead_Time_Days', 'Holding_Cost_Monthly', 'complexity_status_num', 'day_category_num', 'weekly_velocity'])
                       
    base_inv = max(0, model_2_inventory.predict(in2)[0]) if model_2_inventory else base_demand * 1.5 
    
    # INVENTORY GUARDRAIL
    min_safe_inv = base_demand * 1.2
    base_inv = max(base_inv, min_safe_inv)
    
    # 3. CHỐT SỐ LIỆU
    demand_pred = round(base_demand * data.store_scale)
    target_inventory = round(base_inv * data.store_scale) 
    order_qty = max(0, target_inventory - data.current_stock) 
    end_inventory = max(0, data.current_stock + order_qty - demand_pred) 

    return {
        "start_inventory": data.current_stock,
        "demand_pred": int(demand_pred),
        "target_inventory": int(target_inventory),
        "order_qty": int(order_qty),
        "end_inventory": int(end_inventory),
        "ai_overridden": bool(base_demand > raw_ai_demand)
    }