# core/config.py
class Settings:
    PROJECT_NAME: str = "H&M AI Control Tower Backend"
    GOOGLE_API_KEY: str = "AIzaSyAnj5wvpY_IGtnrBwXpzT1JUPbZlkj1Q80"
    MODEL_DEMAND_PATH: str = "model_1_monthly_demand_v3.pkl"
    MODEL_INVENTORY_PATH: str = "model_2_inventory.pkl"
    DATA_PATH: str = "top_100_products.csv"

settings = Settings()