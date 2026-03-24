# main.py
from fastapi import FastAPI, Request  # Thêm Request để đọc dữ liệu từ Frontend
from fastapi.middleware.cors import CORSMiddleware
from routers.api import router as api_router
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)
@app.get("/")
def root_health_check():
    return {"status": "ok", "message": "H&M Global Backend is running perfectly!"}
# Cấu hình CORS (BAO PHỦ MỌI TRƯỜNG HỢP LOCAL VÀ DEPLOY)
origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", # Bổ sung để chống lỗi trình duyệt
    "http://localhost:3001", # Bổ sung nhỡ cổng 3000 bị kẹt
    "https://minh-fashion-stock.vercel.app", 
    "https://fashion-stock.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Nhúng bộ định tuyến API cũ (THÊM PREFIX /api ĐỂ FRONTEND TÌM ĐƯỢC ĐƯỜNG)
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)