# main.py
from fastapi import FastAPI, Request  # Thêm Request để đọc dữ liệu từ Frontend
from fastapi.middleware.cors import CORSMiddleware
from routers.api import router as api_router
from core.config import settings
from chatbot_logic import get_chatbot_response # Import hàm xử lý đã đóng gói

app = FastAPI(title=settings.PROJECT_NAME)

# Cấu hình CORS (ĐÃ SỬA LẠI ĐỂ KHÔNG BỊ LỖI KHI DEPLOY)
origins = [
    "http://localhost:3000", # Cho phép chạy local lúc code Next.js
    "https://minh-fashion-stock.vercel.app" # Mở cửa cho link Vercel của Minh
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Thay vì ["*"] thì trỏ đích danh link luôn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINT CHAT CHO ROBOT ---
@app.post("/api/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    history = data.get("history", []) # Nhận lịch sử chat từ Frontend gửi lên
    
    # Gửi cả message và history vào bộ não xử lý
    bot_reply = get_chatbot_response(user_message, history)
    
    return {"reply": bot_reply}

# Nhúng bộ định tuyến API cũ (cho các tính năng khác như predict, products)
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)