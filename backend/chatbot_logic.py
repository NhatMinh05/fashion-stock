import pandas as pd
import json
import re
from openai import OpenAI # Import thư viện mới

# --- 1. CẤU HÌNH DEEPSEEK API ---
DEEPSEEK_API_KEY = "sk-0f614c0e491842339038c456ec65565d"
# Khởi tạo client trỏ thẳng vào server của DeepSeek
client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

def load_data():
    try:
        return pd.read_csv('top_100_products.csv')
    except Exception as e:
        print(f"⚠️ Lỗi: Không tìm thấy file dữ liệu top_100_products.csv. Chi tiết: {e}")
        return None

df_inventory = load_data()

# --- 2. HỆ THỐNG CỨU CÁNH (Giữ nguyên) ---
def local_fallback(user_input, dataset):
    user_input = user_input.lower()
    found_entity = ""
    if 'article_id' in dataset.columns:
        numbers = re.findall(r'\b\d+\b', user_input)
        for num in numbers:
            if (dataset['article_id'].astype(str) == num).any():
                found_entity = num
                break
    if not found_entity:
        for name in dataset['prod_name'].unique():
            clean_name = re.sub(r'[\.\(\)\d]', '', str(name).lower()).strip()
            if clean_name and (clean_name in user_input or user_input in clean_name):
                found_entity = name
                break
    if any(word in user_input for word in ["lâu nhất", "cũ nhất"]): return "ton_lau_nhat", found_entity
    elif any(word in user_input for word in ["bán chạy", "chạy nhất"]): return "ban_chay_nhat", found_entity
    elif any(word in user_input for word in ["chi phí", "tốn kém"]): return "chi_phi_luu_kho_cao", found_entity
    elif any(word in user_input for word in ["sắp hết", "hết hàng", "đứt hàng"]): return "sap_het_hang", found_entity
    elif any(word in user_input for word in ["giá cao nhất", "đắt nhất", "giá trị nhất", "giá tiền lớn nhất", "đắt tiền nhất"]): return "gia_cao_nhat", found_entity
    return "kiem_tra_ton_kho", found_entity

# --- 3. BỘ NÃO NLP (Đổi sang DeepSeek) ---
def analyze_intent(user_input, chat_history, dataset):
    history_context = ""
    for msg in chat_history[-2:]:
        role = "User" if msg.get('role') == 'user' else "AI"
        history_context += f"{role}: {msg.get('content')}\n"

    prompt_text = f"""
    Lịch sử chat: {history_context}
    Câu hỏi mới: {user_input}
    
    Nhiệm vụ: Trích xuất ý định và Từ khóa sản phẩm.
    - Intent: Chọn 1 trong ['kiem_tra_ton_kho', 'ton_lau_nhat', 'ban_chay_nhat', 'chi_phi_luu_kho_cao', 'sap_het_hang', 'gia_cao_nhat'].
    - Entity: Tên sản phẩm (VD: 'henry polo') HOẶC Mã số sản phẩm (VD: '108775015'). Trả về chuỗi rỗng nếu không có.
    Trả về định dạng JSON: {{"intent": "...", "entity": "..."}}
    """
    try:
        # Gọi API của DeepSeek
        response = client.chat.completions.create(
            model="deepseek-chat", # Sử dụng model deepseek-chat
            messages=[
                {"role": "system", "content": "Bạn là một hệ thống AI chỉ trả về duy nhất định dạng JSON, không giải thích gì thêm."},
                {"role": "user", "content": prompt_text}
            ],
            temperature=0.1 # Để temperature thấp cho kết quả JSON ổn định
        )
        raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "")
        result = json.loads(raw)
        return result.get("intent", "kiem_tra_ton_kho"), str(result.get("entity", ""))
    except Exception as e:
        print(f"Lỗi AI: {e}")
        return local_fallback(user_input, dataset)

# --- 4. TRUY VẤN DỮ LIỆU ĐA CHIỀU (Giữ nguyên) ---
def get_database_response(intent, entity, dataset):
    if intent == "ton_lau_nhat":
        oldest = dataset.sort_values(by='t_dat').iloc[0]
        return f"Sản phẩm tồn lâu nhất là {oldest['prod_name']} (Mã: {oldest.get('article_id', 'N/A')}), nhập từ ngày {oldest['t_dat']}."
    elif intent == "ban_chay_nhat":
        best = dataset.sort_values(by='weekly_velocity', ascending=False).iloc[0]
        return f"Sản phẩm bán chạy nhất là {best['prod_name']} (Mã: {best.get('article_id', 'N/A')}) với tốc độ tiêu thụ {int(best['weekly_velocity'])} sản phẩm/tuần."
    elif intent == "chi_phi_luu_kho_cao":
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
    elif intent == "gia_cao_nhat":
        if 'price' in dataset.columns:
            highest_price = dataset.sort_values(by='price', ascending=False).iloc[0]
            return f"Sản phẩm có giá bán cao nhất là {highest_price['prod_name']} (Mã: {highest_price.get('article_id', 'N/A')}) với mức giá ${highest_price['price']}."
        else:
            return "Dạ, file dữ liệu hiện tại chưa có cột 'price' (giá tiền) để em tra cứu ạ."

    if not entity or len(entity) < 3:
        return "Dạ, anh/chị muốn kiểm tra theo mã số (article_id) hay tên sản phẩm nào ạ?"

    matched = pd.DataFrame()
    if entity.isdigit() and 'article_id' in dataset.columns:
        matched = dataset[dataset['article_id'].astype(str) == entity]
    else:
        matched = dataset[dataset['prod_name'].str.lower().str.contains(entity.lower(), na=False, regex=False)]
    
    if not matched.empty:
        prod = matched.iloc[0]
        return f"Sản phẩm {prod['prod_name']} (Mã: {prod.get('article_id', 'N/A')}) hiện còn {int(prod['Initial_Inventory'])} cái. Ngày nhập kho: {prod['t_dat']}."
    
    if entity.isdigit():
        return f"Em không tìm thấy mã số '{entity}' trong danh sách TOP 100 sản phẩm trong kho."
    else:
        return f"Em không tìm thấy sản phẩm nào có tên gần giống '{entity}' trong kho."

# --- 5. ĐIỂM KẾT NỐI VỚI MAIN.PY (Giữ nguyên) ---
def get_chatbot_response(user_message, history):
    if df_inventory is None or df_inventory.empty:
        return "Dạ, hiện tại em không kết nối được với dữ liệu kho hàng ạ. Vui lòng kiểm tra lại file CSV."
    if len(user_message) < 10 and any(w in user_message.lower() for w in ["hi", "hello", "chào"]):
        return "Dạ chào anh/chị quản lý! Em có thể giúp gì ạ?"
    intent, entity = analyze_intent(user_message, history, df_inventory)
    if len(entity) > 30: 
        _, entity = local_fallback(user_message, df_inventory)
    return get_database_response(intent, entity, df_inventory)