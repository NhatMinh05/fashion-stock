import pandas as pd
import json # Thêm thư viện đọc json
# ĐÃ ĐỔI: Thêm thư viện OpenAI (DeepSeek dùng chuẩn của OpenAI)
from langchain_openai import ChatOpenAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from core.config import settings

# =================================================================
# 1. TẢI DATABASE SIÊU NHẸ (CHO DASHBOARD & CHATBOT)
# =================================================================
try:
    db_dashboard = pd.read_csv("top_100_products.csv", encoding='utf-8-sig')
    print("✅ Đã tải thành công db_dashboard (siêu nhẹ)!")
except Exception as e:
    print(f"❌ Lỗi tải db_dashboard: {e}")
    db_dashboard = pd.DataFrame()

prefix_instructions = """
Bạn là một Chuyên gia Phân tích Dữ liệu và Cố vấn Chiến lược Kho vận cấp cao (Logistics AI Consultant).

PHONG CÁCH GIAO TIẾP:
- Xưng hô: Gọi người dùng là 'Anh/Chị' hoặc 'Quản trị viên', xưng là 'em' hoặc 'Trợ lý AI'.
- Thái độ: Chuyên nghiệp, khách quan, có tư duy logic và luôn sẵn sàng hỗ trợ tối ưu hóa vận hành.
- Ngôn ngữ: Tiếng Việt tự nhiên, lịch thiệp.

QUY TẮC ỨNG XỬ:

1. Giao tiếp Thông minh (Social & General): 
   - Nếu người dùng chào hỏi, hỏi về tác giả hoặc khả năng của bạn: Hãy trả lời một cách thông minh, khiêm tốn. 
   - Ví dụ: "Dạ chào Anh/Chị, em là Trợ lý AI chuyên trách phân tích kho vận cho dự án H&M của nhóm nghiên cứu."
   - TUYỆT ĐỐI KHÔNG viết code Python khi chỉ giao tiếp thông thường để tránh lỗi hệ thống.

2. Phân tích Dữ liệu (Sử dụng Python):
   - Khi có yêu cầu về số liệu (tồn kho, doanh thu, mã hàng...): Tự động viết code Python để truy vấn dataframe 'df'.
   - Phải giải thích ý nghĩa con số sau khi truy vấn xong.

3. Tư duy Cố vấn Chiến lược:
   - Dựa trên dữ liệu, hãy đưa ra các nhận định kinh doanh (Ví dụ: Mã này đang bán chạy, cần ưu tiên nhập hàng; mã kia tồn kho cao, cần đẩy mạnh marketing).
   - Luôn hướng tới mục tiêu: Giảm chi phí lưu kho và tối ưu hóa lợi nhuận.

4. Bảo mật & Xử lý lỗi:
   - Nếu không tìm thấy thông tin: "Dạ Anh/Chị vui lòng kiểm tra lại mã sản phẩm, em chưa tìm thấy dữ liệu tương ứng trong kho ạ."
"""

# =================================================================
# KHỞI TẠO AGENT VỚI DEEPSEEK
# =================================================================
try:
    # ĐÃ ĐỔI: Cấu hình trỏ tới máy chủ của DeepSeek
    llm = ChatOpenAI(
        model="deepseek-chat", 
        api_key=settings.DEEPSEEK_API_KEY, # Đảm bảo file config.py đã có biến này
        base_url="https://api.deepseek.com", 
        temperature=0
    )
    agent = create_pandas_dataframe_agent(
        llm, 
        db_dashboard, 
        verbose=True, 
        allow_dangerous_code=True,
        prefix=prefix_instructions, 
        handle_parsing_errors=True, 
        max_iterations=3,
        agent_type="openai-tools"  # <--- Thay bằng chuỗi chữ này
    )
    print("✅ Đã khởi tạo AI LangChain Agent (DeepSeek Engine)!")
except Exception as e:
    print(f"❌ Lỗi khởi tạo LangChain: {e}")
    agent = None

def get_all_products_data() -> list:
    """Trả về danh sách 100 sản phẩm để hiển thị trên web"""
    if db_dashboard.empty: return []
    return db_dashboard.to_dict(orient="records")

def process_chat_message(message: str) -> str:
    """Xử lý tin nhắn của user qua LangChain"""
    if not agent:
        return "⚠️ Hệ thống LangChain chưa được kết nối."
    try:
        response = agent.invoke({"input": message})
        return response["output"]
    except Exception as e:
        return "❌ Lỗi hệ thống: DeepSeek API đang quá tải hoặc lỗi cú pháp."

# =================================================================
# 2. HÀM MÁY ÉP (CHỈ ĐỌC TỜ GIẤY NOTE JSON BÉ TÍ TE - TỐC ĐỘ BÀN THỜ)
# =================================================================
def get_summary_data() -> dict:
    """Đọc thẳng kết quả 31.7 triệu dòng đã được tính toán sẵn từ file JSON"""
    try:
        # Ép cứng đường dẫn tuyệt đối để không bao giờ bị lỗi đọc sai chỗ
        read_path = r"D:\Dự án DAP\backend\analytics_summary.json"
        
        with open(read_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        print("Lỗi đọc file json:", e)
        return {
            "status": "error", 
            "message": "Chưa có file analytics_summary.json. Hãy copy từ ổ C qua hoặc chạy file data_engine.py trước!"
        }