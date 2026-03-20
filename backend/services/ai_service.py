import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from core.config import settings

# Tải Database
try:
    product_db = pd.read_csv(settings.DATA_PATH, encoding='utf-8-sig')
    print(" Đã tải Database thành công!")
except Exception as e:
    print(f" Lỗi tải Database: {e}")
    product_db = pd.DataFrame()

prefix_instructions = """
Bạn là Trợ lý Quản trị Kho vận cao cấp của nhóm Vũ Ngọc Dinh.
Xưng hô: 'em' - 'anh/chị'.

QUY TẮC SỐ 1 (CỰC KỲ QUAN TRỌNG): 
Nếu người dùng chỉ chào hỏi (VD: "chào em", "hello", "hi"), hãy chào lại lịch sự và KHÔNG ĐƯỢC viết code Python hay truy vấn dữ liệu.

QUY TẮC SỐ 2 (PHẦN 3 OUTPUT): 
KHI VÀ CHỈ KHI người dùng hỏi về dự báo, số lượng nhập hàng, hoặc mã hàng, bạn MỚI truy vấn dataframe 'df' và BẮT BUỘC đưa ra báo cáo 4 chỉ số sau:
1. Forecasted_Demand (Nhu cầu dự báo)
2. Safety_Stock (Tồn kho an toàn - từ cột SS)
3. Optimal_Order_Quantity (Số lượng đề xuất nhập thêm)
4. Estimated_Cost (Chi phí ước tính)
"""

# Khởi tạo Agent
try:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.GOOGLE_API_KEY, temperature=0)
    agent = create_pandas_dataframe_agent(
        llm, product_db.head(100), verbose=True, allow_dangerous_code=True,
        prefix=prefix_instructions, handle_parsing_errors=True, max_iterations=3
    )
    print(" Đã khởi tạo AI LangChain Agent!")
except Exception as e:
    print(f" Lỗi khởi tạo LangChain: {e}")
    agent = None

def get_all_products_data() -> list:
    """Trả về danh sách sản phẩm để hiển thị trên web"""
    if product_db.empty: return []
    return product_db.to_dict(orient="records")

def process_chat_message(message: str) -> str:
    """Xử lý tin nhắn của user qua LangChain"""
    if not agent:
        return " Hệ thống LangChain chưa được kết nối."
    try:
        response = agent.invoke({"input": message})
        return response["output"]
    except Exception as e:
        return " Lỗi hệ thống: Google API đang quá tải hoặc lỗi cú pháp."