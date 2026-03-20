import streamlit as st
import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

# --- 1. CẤU HÌNH GIAO DIỆN ---
st.set_page_config(page_title="Quản trị Kho vận - Group 3", layout="wide")
st.title("📊 Hệ thống Cố vấn Kho vận thông minh (H&M)")
st.subheader("Dành cho Chủ cửa hàng - Nhóm Vũ Ngọc Dinh")

# --- 2. ĐỊNH NGHĨA CHUYÊN GIA (Luật thép cho AI) ---
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

# --- 3. HÀM KHỞI TẠO (Tối ưu để không bị lỗi 429) ---
@st.cache_resource
def init_agent_deploy(): 
    path_data = r'D:\ADY201m\Luyện_tập_pandas\HM_Scientific_Master_Final_ML.csv'
    
    try:
        # Lấy 100 dòng đầu để AI không bị quá tải Token khi chạy Free
        df = pd.read_csv(path_data).head(100) 
    except Exception as e:
        st.error(f"⚠️ Lỗi đọc file CSV: {e}")
        return None

    api_key = "AIzaSyAnj5wvpY_IGtnrBwXpzT1JUPbZlkj1Q80"
    
    llm = ChatGoogleGenerativeAI(
        # Đưa về 1.5-flash vì nó tốn ít Token hơn, cực kỳ an toàn cho gói Free
        model="gemini-2.0-flash", 
        google_api_key=api_key, 
        temperature=0
    )
    
    return create_pandas_dataframe_agent(
        llm, 
        df, 
        verbose=True, 
        allow_dangerous_code=True,
        prefix=prefix_instructions,
        handle_parsing_errors=True,
        # CHỐT CHẶN AN TOÀN: Bắt buộc AI dừng sau 3 lần thử, không lặp vô tận
        max_iterations=3, 
        early_stopping_method="generate"
    )

agent = init_agent_deploy()

# --- 4. QUẢN LÝ LỊCH SỬ CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Dạ em chào anh/chị quản lý! Em là AI điều phối kho của nhóm Vũ Ngọc Dinh. Anh/chị cần em kiểm tra mã hàng hay dự báo nhập hàng cho nhóm nào ạ?"}
    ]

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# --- 5. XỬ LÝ NHẬP LIỆU (Đã bọc thép chống lỗi 429) ---
if prompt := st.chat_input("Nhập câu hỏi (VD: 'Tính mã số 1')..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)

    with st.chat_message("assistant"):
        # 1. ĐÁNH CHẶN CÂU CHÀO (KHÔNG DÙNG AI, KHÔNG TỐN TOKEN)
        chao_hoi = ["chào", "chao", "hello", "hi", "xin chào"]
        if any(word in prompt.lower() for word in chao_hoi) and len(prompt) < 20:
            answer = "Dạ em chào anh/chị ạ! Anh/chị cần em tính toán số lượng đề xuất nhập thêm (Optimal_Order_Quantity) cho mã hàng nào hôm nay?"
            st.write(answer)
            st.session_state.messages.append({"role": "assistant", "content": answer})
            
        # 2. CHỈ DÙNG AI KHI HỎI NGHIỆP VỤ KHO VẬN
        else:
            with st.spinner("Em đang tính toán bằng thuật toán AI..."):
                if agent:
                    try:
                        response = agent.invoke({"input": prompt}) 
                        answer = response["output"]
                        
                        st.write(answer)
                        st.session_state.messages.append({"role": "assistant", "content": answer})
                    except Exception as e:
                        st.error("Dạ Google API đang quá tải do nhiều request. Anh/chị đợi giúp em 30 giây rồi gõ lại mã hàng nhé!")
