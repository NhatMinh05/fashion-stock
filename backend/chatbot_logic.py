import pandas as pd
import google.generativeai as genai
import json
import re

# --- 1. CẤU HÌNH ---
GEMINI_API_KEY = "AIzaSyChih33uNHhj0HBmb6K93XmU7J8yvtDv0U"
genai.configure(api_key=GEMINI_API_KEY)

# Lưu ý nhỏ: Google hiện tại đang chạy bản 1.5 Pro là bản thông minh và ổn định nhất. 
# Mình cấu hình 1.5-pro để đảm bảo API của bạn không bị lỗi kết nối nhé!
model = genai.GenerativeModel('gemini-1.5-pro')

def load_data():
    try:
        return pd.read_csv('top_100_products.csv')
    except Exception as e:
        print(f"⚠️ Lỗi: Không tìm thấy file dữ liệu top_100_products.csv. Chi tiết: {e}")
        return None

df_inventory = load_data()

# --- 2. HỆ THỐNG CỨU CÁNH (Fuzzy Local Search & ID Search) ---
def local_fallback(user_input, dataset):
    user_input = user_input.lower()
    found_entity = ""
    
    # Ưu tiên 1: Quét tìm mã số (article_id) trực tiếp
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
    return "kiem_tra_ton_kho", found_entity

# --- 3. BỘ NÃO NLP (Có Context) ---
def analyze_intent(user_input, chat_history, dataset):
    history_context = ""
    # Trích xuất 2 tin nhắn gần nhất để AI hiểu ngữ cảnh
    for msg in chat_history[-2:]:
        role = "User" if msg.get('role') == 'user' else "AI"
        history_context += f"{role}: {msg.get('content')}\n"

    prompt_text = f"""
    Lịch sử chat: {history_context}
    Câu hỏi mới: {user_input}
    
    Nhiệm vụ: Trích xuất ý định và Từ khóa sản phẩm.
    - Intent: Chọn 1 trong ['kiem_tra_ton_kho', 'ton_lau_nhat', 'ban_chay_nhat', 'chi_phi_luu_kho_cao', 'sap_het_hang'].
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

# --- 4. TRUY VẤN DỮ LIỆU ĐA CHIỀU ---
def get_database_response(intent, entity, dataset):
    # Xử lý 4 câu hỏi phân tích chung
    if intent == "ton_lau_nhat":
        oldest = dataset.sort_values(by='t_dat').iloc[0]
        return f"Sản phẩm tồn lâu nhất là {oldest['prod_name']} (Mã: {oldest.get('article_id', 'N/A')}), nhập từ ngày {oldest['t_dat']}."
    elif intent == "ban_chay_nhat":
        best = dataset.sort_values(by='weekly_velocity', ascending=False).iloc[0]
        return f"Sản phẩm bán chạy nhất là {best['prod_name']} (Mã: {best.get('article_id', 'N/A')}) với tốc độ tiêu thụ {int(best['weekly_velocity'])} sản phẩm/tuần."
    elif intent == "chi_phi_luu_kho_cao":
        # Tạo bản sao hoặc tính trực tiếp để tránh cảnh báo SettingWithCopyWarning của Pandas
        dataset = dataset.copy()
        dataset['Total_Holding_Cost'] = dataset['Initial_Inventory'] * dataset['Holding_Cost_Monthly']
        most_expensive = dataset.sort_values(by='Total_Holding_Cost', ascending=False).iloc[0]
        return f"Sản phẩm tốn nhiều chi phí lưu kho nhất là {most_expensive['prod_name']} (Mã: {most_expensive.get('article_id', 'N/A')}). Tổng phí ước tính: ${most_expensive['Total_Holding_Cost']:.2f}/tháng."
    elif intent == "sap_het_hang":
        dataset = dataset.copy()
        velocity = dataset['weekly_velocity'].replace(0, 0.001)
        dataset['Weeks_of_Supply'] = dataset['Initial_Inventory'] / velocity
        risk = dataset.sort_values(by='Weeks_of_Supply').iloc[0]
        return f"Cảnh báo: Sản phẩm {risk['prod_name']} (Mã: {risk.get('article_id', 'N/A')}) có nguy cơ đứt hàng cao nhất. Chỉ còn {int(risk['Initial_Inventory'])} cái, dự kiến cạn kho trong {risk['Weeks_of_Supply']:.1f} tuần."

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
        return f"Sản phẩm {prod['prod_name']} (Mã: {prod.get('article_id', 'N/A')}) hiện còn {int(prod['Initial_Inventory'])} cái. Ngày nhập kho: {prod['t_dat']}."
    
    if entity.isdigit():
        return f"Em không tìm thấy mã số '{entity}' trong danh sách TOP 100 sản phẩm trong kho."
    else:
        return f"Em không tìm thấy sản phẩm nào có tên gần giống '{entity}' trong kho."

# --- 5. ĐIỂM KẾT NỐI VỚI MAIN.PY ---
def get_chatbot_response(user_message, history):
    if df_inventory is None or df_inventory.empty:
        return "Dạ, hiện tại em không kết nối được với dữ liệu kho hàng ạ. Vui lòng kiểm tra lại file CSV."

    # Xử lý nhanh câu chào
    if len(user_message) < 10 and any(w in user_message.lower() for w in ["hi", "hello", "chào"]):
        return "Dạ chào anh/chị quản lý! Em có thể giúp gì ạ?"

    # Chạy NLP
    intent, entity = analyze_intent(user_message, history, df_inventory)
    
    # Fallback nếu AI bóc tách sai cụm quá dài
    if len(entity) > 30: 
        _, entity = local_fallback(user_message, df_inventory)
        
    return get_database_response(intent, entity, df_inventory)