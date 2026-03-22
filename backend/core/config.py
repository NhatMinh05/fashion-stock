import os
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env (nếu chạy trên máy tính của bạn)
load_dotenv()

class Settings:
    PROJECT_NAME: str = "H&M AI Control Tower Backend"
    # Lấy Key bí mật từ hệ thống, không ghi trực tiếp vào code nữa!
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    MODEL_DEMAND_PATH: str = "model_1_monthly_demand_v3.pkl"
    MODEL_INVENTORY_PATH: str = "model_2_inventory.pkl"
    # Đã đổi thành đường dẫn tương đối để lên server không bị lỗi
    DATA_PATH: str = "HM_Scientific_Master_FinalPro_ML.csv" 

settings = Settings()