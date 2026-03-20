import streamlit as st
import pandas as pd
import google.generativeai as genai
import json
import re

# --- 1. CẤU HÌNH GIAO DIỆN & TẢI DỮ LIỆU ---
st.set_page_config(page_title="H&M Inventory AI (Smart ID)", layout="wide")
st.title("H&M Inventory AI - Trợ lý Ảo")

@st.cache_data
def load_data():
    # Chỉ load duy nhất 1 file top 100
    return pd.read_csv('top_100_products.csv')

try:
    df = load_data()
except Exception as e:
    st.error("Lỗi: Không tìm thấy file dữ liệu 'top_100_products.csv'.")
    st.stop()

# Cấu hình API
GEMINI_API_KEY = "AIzaSyChih33uNHhj0HBmb6K93XmU7J8yvtDv0U"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-pro')

# --- 2. HỆ THỐNG ---
def local_fallback(user_input, dataset):
    user_input = user_input.lower()
    found_entity = ""
    
    # Ưu tiên 1: Quét tìm mã số (article_id) trực tiếp trong top 100
    if 'article_id' in dataset.columns:
        numbers = re.findall(r'\b\d+\b', user_input)
        for num in numbers:
            if (dataset['article_id'].astype(str) == num).any():
                found_entity = num
                break
            
    # Ưu tiên 2: Nếu không có mã số, tìm bằng Tên sản phẩm
    if not found_entity:
        for name in dataset['prod_name'].unique():
            clean_name = re.sub(r'[\.\(\)\d]', '', str(name).lower()).strip()
            if clean_name and (clean_name in user_input or user_input in clean_name):
                found_entity = name
                break
            
    # Phân loại ý định
    if any(word in user_input for word in ["lâu nhất", "cũ nhất"]): return "ton_lau_nhat", found_entity
    elif any(word in user_input for word in ["bán chạy", "chạy nhất"]): return "ban_chay_nhat", found_entity
    elif any(word in user_input for word in ["chi phí", "tốn kém"]): return "chi_phi_luu_kho_cao", found_entity
    elif any(word in user_input for word in ["sắp hết", "hết hàng", "đứt hàng"]): return "sap_het_hang", found_entity
    elif any(word in user_input for word in ["giá cao nhất", "đắt nhất", "giá trị nhất", "giá tiền lớn nhất", "đắt tiền nhất"]): return "gia_cao_nhat", found_entity
    return "kiem_tra_ton_kho", found_entity

# --- 3. BỘ NÃO NLP ---
def analyze_intent(user_input, chat_history, dataset):
    history_context = "".join([f"{msg['role']}: {msg['content']}\n" for msg in chat_history[-2:]])

    prompt_text = f"""
    Lịch sử chat: {history_context}
    Câu hỏi mới: {user_input}
    
    Nhiệm vụ: Trích xuất ý định và Từ khóa sản phẩm.
    - Intent: Chọn 1 trong ['kiem_tra_ton_kho', 'ton_lau_nhat', 'ban_chay_nhat', 'chi_phi_luu_kho_cao', 'sap_het_hang', 'gia_cao_nhat'].
    - Entity: Tên sản phẩm (VD: 'henry polo') HOẶC Mã số sản phẩm (VD: '108775015'). Trả về chuỗi rỗng nếu không có.
    Trả về định dạng JSON: {{"intent": "...", "entity": "..."}}
    """
    try:
        response = model.generate_content(prompt_text)
        raw = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(raw)
        return result.get("intent", "kiem_tra_ton_kho"), str(result.get("entity", ""))
    except:
        return local_fallback(user_input, dataset)

# --- 4. TRUY VẤN DỮ LIỆU ---
def get_database_response(intent, entity, dataset):
    # Xử lý 5 câu hỏi phân tích chung
    if intent == "ton_lau_nhat":
        oldest = dataset.sort_values(by='t_dat').iloc[0]
        return f"Sản phẩm tồn lâu nhất là {oldest['prod_name']} (Mã: {oldest.get('article_id', 'N/A')}), nhập từ ngày {oldest['t_dat']}."
    elif intent == "ban_chay_nhat":
        best = dataset.sort_values(by='weekly_velocity', ascending=False).iloc[0]
        return f"Sản phẩm bán chạy nhất là {best['prod_name']} (Mã: {best.get('article_id', 'N/A')}) với tốc độ tiêu thụ {int(best['weekly_velocity'])} sản phẩm/tuần."
    elif intent == "chi_phi_luu_kho_cao":
        dataset['Total_Holding_Cost'] = dataset['Initial_Inventory'] * dataset['Holding_Cost_Monthly']
        most_expensive = dataset.sort_values(by='Total_Holding_Cost', ascending=False).iloc[0]
        return f"Sản phẩm tốn nhiều chi phí lưu kho nhất là {most_expensive['prod_name']} (Mã: {most_expensive.get('article_id', 'N/A')}). Tổng phí ước tính: ${most_expensive['Total_Holding_Cost']:.2f}/tháng."
    elif intent == "sap_het_hang":
        velocity = dataset['weekly_velocity'].replace(0, 0.001)
        dataset['Weeks_of_Supply'] = dataset['Initial_Inventory'] / velocity
        risk = dataset.sort_values(by='Weeks_of_Supply').iloc[0]
        return f"Cảnh báo: Sản phẩm {risk['prod_name']} (Mã: {risk.get('article_id', 'N/A')}) có nguy cơ đứt hàng cao nhất. Chỉ còn {int(risk['Initial_Inventory'])} cái, dự kiến cạn kho trong {risk['Weeks_of_Supply']:.1f} tuần."
    elif intent == "gia_cao_nhat":
        # Hàm kiểm tra và truy xuất giá cao nhất
        if 'price' in dataset.columns:
            highest_price = dataset.sort_values(by='price', ascending=False).iloc[0]
            return f"Sản phẩm có giá bán cao nhất là {highest_price['prod_name']} (Mã: {highest_price.get('article_id', 'N/A')}) với mức giá ${highest_price['price']}."
        else:
            return "Dạ, file dữ liệu hiện tại chưa có cột 'price' (giá tiền) để em tra cứu ạ."

    # Xử lý câu hỏi kiểm tra tồn kho cụ thể
    if not entity or len(entity) < 3:
        return "Dạ, anh/chị muốn kiểm tra theo mã số (article_id) hay tên sản phẩm nào ạ?"

    # Kiểm tra xem entity người dùng nhập là MÃ SỐ hay TÊN SẢN PHẨM
    matched = pd.DataFrame()
    
    if entity.isdigit() and 'article_id' in dataset.columns:
        # Nếu là chuỗi số, tìm đích danh trong cột article_id
        matched = dataset[dataset['article_id'].astype(str) == entity]
    else:
        # Nếu là chữ, tìm tương đối trong cột prod_name
        matched = dataset[dataset['prod_name'].str.lower().str.contains(entity.lower(), na=False, regex=False)]
    
    # Trả về kết quả
    if not matched.empty:
        prod = matched.iloc[0]
        # In thêm mã article_id để người dùng xác nhận đúng món hàng
        return f"Sản phẩm {prod['prod_name']} (Mã: {prod.get('article_id', 'N/A')}) hiện còn {int(prod['Initial_Inventory'])} cái. Ngày nhập kho: {prod['t_dat']}."
    
    if entity.isdigit():
        return f"Em không tìm thấy mã số '{entity}' trong danh sách TOP 100 sản phẩm trong kho."
    else:
        return f"Em không tìm thấy sản phẩm nào có tên gần giống '{entity}' trong kho."
    

# --- 5. GIAO DIỆN CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "Chào anh/chị. Em đã sẵn sàng hỗ trợ tra cứu bằng Tên hoặc Mã số sản phẩm!"}]

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]): st.write(msg["content"])

if prompt := st.chat_input("Nhập câu hỏi (VD: Mã số 108775015 còn hàng không?)..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"): st.write(prompt)

    with st.chat_message("assistant"):
        if len(prompt) < 10 and any(w in prompt.lower() for w in ["hi", "hello", "chào"]):
            answer = "Dạ chào anh/chị quản lý! Em có thể giúp gì ạ?"
        else:
            intent, entity = analyze_intent(prompt, st.session_state.messages, df)
            if len(entity) > 30: 
                _, entity = local_fallback(prompt, df)
            answer = get_database_response(intent, entity, df)
            
        st.write(answer)
        st.session_state.messages.append({"role": "assistant", "content": answer})