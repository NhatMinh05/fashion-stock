import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import joblib
import plotly.express as px
import plotly.graph_objects as go
import os
import asyncio
import streamlit.components.v1 as components
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

# --- 1. CẤU HÌNH GIAO DIỆN ---
st.set_page_config(page_title="H&M Supply Chain AI", page_icon="🚚", layout="wide")

# --- HÀM FIX LỖI: RESET KHO KHI ĐỔI SẢN PHẨM ---
def reset_stock_logic():
    st.session_state.auto_stock = 0

# --- 2. CSS SIÊU CẤP (GIỮ NGUYÊN 100% CỦA BẠN) ---
st.markdown("""
    <style>
    /* 1. Nền tổng thể: Xám nhạt ở Light, Đen ở Dark */
    .stApp { background-color: var(--secondary-background-color) !important; }
    
    /* 2. Thanh Sidebar tối màu LUÔN LUÔN giữ nguyên */
    section[data-testid="stSidebar"] { background-color: #1A222C !important; }
    
    /* 3. Đẩy nội dung lên sát mép trên */
    .block-container { padding-top: 0.5rem !important; padding-bottom: 2rem; }

    /* 4. THANH TRƯỢT HEADER */
    header[data-testid="stHeader"] {
        transform: translateY(-95%); 
        transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
        background-color: var(--background-color) !important;
        opacity: 0.9;
        backdrop-filter: blur(10px);
        z-index: 999999;
    }
    header[data-testid="stHeader"]:hover { transform: translateY(0%); }

    /* ANIMATION FADE-IN UP */
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* ========================================================= */
    /* TÂN TRANG Ô NHẬP LIỆU CHUẨN FIGMA (GIỮ NGUYÊN NÉT NHƯ CODE CŨ) 🔥 */
    /* ========================================================= */
    
    /* Chỉnh toàn bộ Selectbox và NumberInput */
    .stSelectbox div[data-baseweb="select"] > div,
    .stNumberInput div[data-baseweb="input"] > div {
        border-radius: 10px !important; /* Bo góc mượt mà */
        /* Dùng viền rgba(150, 160, 170, 0.4) để tạo ra đúng màu #CBD5E1 trên nền trắng, và xám viền nét trên nền đen */
        border: 1px solid rgba(150, 160, 170, 0.4) !important; 
        background-color: var(--background-color) !important; /* Trắng tinh ở Light, Đen tuyền ở Dark */
        transition: border-color 0.3s, box-shadow 0.3s !important;
    }
    
    /* Hiệu ứng khi rê chuột vào ô nhập liệu */
    .stSelectbox div[data-baseweb="select"] > div:hover,
    .stNumberInput div[data-baseweb="input"] > div:hover {
        border-color: #38BDF8 !important;
    }

    /* Hiệu ứng khi Click/Focus vào ô nhập liệu (Sáng viền xanh Cyan) */
    .stSelectbox div[data-baseweb="select"] > div:focus-within,
    .stNumberInput div[data-baseweb="input"] > div:focus-within {
        border-color: #38BDF8 !important;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2) !important;
    }

    /* Đổi màu chữ Label của ô nhập liệu: Đen ở Light, Trắng ở Dark */
    .stSelectbox label, .stNumberInput label {
        color: var(--text-color) !important;
        font-weight: 600 !important;
    }

    /* ========================================================= */

    /* 5. THẺ CARD TỐI MÀU (Top 4 Metrics) - LUÔN LUÔN TỐI */
    .dark-card {
        background-color: #273142 !important; padding: 20px; border-radius: 15px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15); text-align: center; margin-bottom: 20px;
        border-bottom: 4px solid #38BDF8;
        animation: fadeInUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; 
    }
    .dark-card h4 { color: #94A3B8 !important; font-size: 13px; text-transform: uppercase; margin-bottom: 5px; font-weight: 600;}
    .dark-card h2 { color: #FFFFFF !important; font-size: 26px; font-weight: bold; margin: 0;}

    /* 6. THẺ CONTAINER KÍNH MỜ (SIMULATOR) - TRẮNG TẠI LIGHT, ĐEN TẠI DARK */
    [data-testid="column"]:nth-of-type(1) [data-testid="stVerticalBlockBorderWrapper"] {
        background-color: var(--background-color) !important; 
        opacity: 0.95;
        backdrop-filter: blur(12px) !important; 
        -webkit-backdrop-filter: blur(12px) !important; padding: 25px !important; 
        border-radius: 15px !important; box-shadow: 0 8px 32px 0 rgba(0,0,0,0.05) !important; 
        border: 1px solid rgba(150, 160, 170, 0.2) !important; margin-bottom: 20px !important;
        animation: fadeInUp 0.7s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    }

    /* 7. NÚT BẤM ĐỎ H&M (Pulse Glow) - BẢO TOÀN HIỆU ỨNG CHO BẠN */
    @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.6); }
        70% { box-shadow: 0 0 0 12px rgba(204, 0, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(204, 0, 0, 0); }
    }
    div.stButton > button:first-child {
        background: linear-gradient(135deg, #CC0000 0%, #990000 100%);
        color: white; border-radius: 12px; height: 55px; font-weight: bold; font-size: 18px; border: none;
        transition: all 0.3s ease; animation: pulseGlow 2s infinite; 
    }
    div.stButton > button:first-child:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(204,0,0,0.4); animation: none; }

    /* 8. NHUỘM MÀU XANH ĐEN CỘT PHẢI - LUÔN LUÔN TỐI */
    [data-testid="column"]:nth-of-type(2) [data-testid="stVerticalBlockBorderWrapper"] {
        background-color: #273142 !important; border: 1px solid #334155 !important; 
        border-radius: 15px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        padding: 20px !important; animation: fadeInUp 0.9s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    }
    [data-testid="column"]:nth-of-type(2) h3 { color: #FFFFFF !important; text-align: center !important; margin-top: 0px !important; font-weight: 700 !important; }

    /* 9. FIX MÀU EXPANDER - LUÔN LUÔN TỐI */
    .stExpander { background-color: #273142 !important; border: 1px solid #334155 !important; border-radius: 15px !important; margin-bottom: 10px !important; }
    .stExpander details { background-color: #273142 !important; border-radius: 15px !important; }
    .stExpander summary { background-color: #273142 !important; color: white !important; border-radius: 15px !important; list-style: none; }
    .stExpander summary:hover { background-color: #334155 !important; color: #38BDF8 !important; }
    .stExpander div[data-testid="stExpanderDetails"] { background-color: #273142 !important; border-radius: 0 0 15px 15px !important; padding: 15px !important; }
    .stExpander fieldset { border: none !important; }
    [data-testid="stVerticalBlockBorderWrapper"] { border: none; background-color: transparent; padding: 0; }
    
    /* FIX MÀU CHỮ CHATBOX TRONG EXPANDER ĐỂ KHÔNG BỊ MÙ CHỮ Ở LIGHT MODE */
    .stExpander [data-testid="stChatMessage"] { background-color: rgba(255,255,255,0.05) !important; border-radius: 10px !important; padding: 10px !important; margin-bottom: 10px !important; border: 1px solid rgba(255,255,255,0.1) !important;}
    .stExpander [data-testid="stChatMessage"] * { color: #FFFFFF !important; }
    .stExpander [data-testid="stChatInput"] { background-color: rgba(0,0,0,0.2) !important; border: 1px solid #334155 !important; border-radius: 10px !important; margin-top: 10px;}
    .stExpander [data-testid="stChatInput"] textarea { color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF !important; }
    
    /* ========================================================= */
    /* ĐOẠN CSS MA THUẬT: LÀM LOGO TRONG SUỐT, BỰ RA VÀ CĂN GIỮA */
    /* ========================================================= */
    [data-testid="stSidebar"] [data-testid="stImage"] {
        background-color: transparent !important;
        text-align: center !important; 
        display: block !important;
    }
    
    [data-testid="stSidebar"] [data-testid="stImage"] img {
        filter: invert(1) hue-rotate(180deg) brightness(2) !important; 
        mix-blend-mode: screen !important; 
        background-color: transparent !important;
        width: 85% !important; 
        margin: 10px auto !important; 
        transform: scale(1.6) !important; 
    }
    </style>
""", unsafe_allow_html=True)

# --- 3. TẢI MODEL & DATA (ÉP BUỘC ĐỌC FILE MỚI NHẤT, KHÔNG DÙNG CACHE NỮA) ---
@st.cache_resource
def load_models():
    try: return joblib.load('model_1_monthly_demand_v3.pkl'), joblib.load('model_2_inventory.pkl')
    except: return None, None

# 🔥 ĐÃ XÓA @st.cache_data ĐỂ ĐẢM BẢO WEB LUÔN CẬP NHẬT SỐ LIỆU MỚI NHẤT
def load_product_database():
    try:
        # NHẮM MẮT ĐỌC DUY NHẤT 1 FILE CSV NÀY, KHÔNG LẰNG NHẰNG TÍNH TOÁN NỮA
        df_prod = pd.read_csv('top_100_products.csv', encoding='utf-8-sig')
        return {f"{r['prod_name']} ({r['article_id']})": r for _, r in df_prod.iterrows()}
    except Exception as e:
        st.error(f"Lỗi: Không tìm thấy file 'top_100_products.csv'. Chi tiết: {e}")
        return {}

model_1_demand, model_2_inventory = load_models()
product_db = load_product_database()
REAL_DEMAND_ACCURACY = 76  
REAL_INVENTORY_ACCURACY = 81 

# --- 4. KHỞI TẠO CHATBOT ---
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

@st.cache_resource
def init_agent_deploy(): 
    # Vá lỗi Event Loop của Chatbot Google Generative AI
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    # Chatbot cũng chỉ được phép đọc file chuẩn
    try:
        df = pd.read_csv('top_100_products.csv', encoding='utf-8-sig')
    except Exception:
        return None

    api_key = "AIzaSyAnj5wvpY_IGtnrBwXpzT1JUPbZlkj1Q80"
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key, temperature=0)
        return create_pandas_dataframe_agent(
            llm, df, verbose=True, allow_dangerous_code=True,
            prefix=prefix_instructions, handle_parsing_errors=True,
            max_iterations=3, early_stopping_method="generate"
        )
    except: return None

agent = init_agent_deploy()

# --- 5. THANH MENU BÊN TRÁI ---
with st.sidebar:
    st.image("logo.jpg",use_container_width=True)
    st.markdown("<br>", unsafe_allow_html=True)
    selected = option_menu(
        menu_title=None,
        options=["Dashboard (AI)", "Tra cứu hệ thống", "Cài đặt Admin"],
        icons=["grid-1x2-fill", "server", "gear-fill"],
        styles={
            "container": { "padding": "0!important", "background-color": "#1A222C", "border": "none" },
            "icon": {"color": "#94A3B8", "font-size": "18px"}, 
            "nav-link": {"color": "#94A3B8", "font-size": "15px", "text-align": "left", "margin":"5px", "--hover-color": "#273142"},
            "nav-link-selected": {"background-color": "#38BDF8", "color": "#0F172A", "font-weight": "bold", "border-radius": "10px"},
        }
    )

# --- 6. MÀN HÌNH CHÍNH ---
if selected == "Dashboard (AI)":
    
    if 'auto_stock' not in st.session_state:
        st.session_state.auto_stock = 0
        
    if 'previous_product' not in st.session_state:
        st.session_state.previous_product = None
    
    col_t1, col_t2 = st.columns([1.6, 1])
    with col_t1: 
        st.markdown("""
            <h1 style='color: var(--text-color); font-weight:900; margin-bottom: 0px; padding-bottom: 0px; font-size: 38px;'>AI Control Tower</h1>
            <p style='color: var(--text-color); opacity: 0.7; font-size:16px; margin-top: 0px; padding-top: 0px;'>Dự báo bán ra và dự báo tồn kho theo thời gian thực</p>
        """, unsafe_allow_html=True)
    with col_t2: 
        st.markdown("<div style='margin-top: 25px;'></div>", unsafe_allow_html=True) 
        # NẾU product_db RỖNG THÌ SẼ BÁO LỖI, NẾU CÓ THÌ MỚI HIỆN
        if product_db:
            selected_product = st.selectbox("Mã hàng đang theo dõi:", list(product_db.keys()), on_change=reset_stock_logic)
            if st.session_state.previous_product != selected_product:
                st.session_state.auto_stock = 0 
                st.session_state.previous_product = selected_product

    if product_db:
        prod_data = product_db[selected_product]
        
        if prod_data["weekly_velocity"] > 100:
            ai_msg = f"<b>AI Nhận định:</b> Đây là mặt hàng 'Top Seller' (Bán rất chạy: {int(prod_data['weekly_velocity'])} cái/tuần). "
        else: ai_msg = f"<b>AI Nhận định:</b> Mặt hàng có sức bán ổn định. "
            
        if prod_data["complexity_status"] != "B":
            ai_msg += "Tuy nhiên, mã này gia công KHÓ, nguy cơ trễ Lead Time rất cao! Cần chú ý lượng tồn kho an toàn."
        else: ai_msg += "Gia công cơ bản, chuỗi cung ứng rủi ro thấp."
            
        st.markdown(f"""
            <div style="background-color: var(--background-color); padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(150, 160, 170, 0.3); box-shadow: 0 4px 10px rgba(0,0,0,0.04); margin-top: 10px; margin-bottom: 25px; animation: fadeInUp 0.4s forwards;">
                <span style="color: var(--text-color); font-size: 16px;"> {ai_msg}</span>
            </div>
        """, unsafe_allow_html=True)
        
        c1, c2, c3, c4 = st.columns(4)
        with c1: st.markdown(f'<div class="dark-card"><h4> GIÁ BÁN GỐC</h4><h2>${prod_data["price"]:.2f}</h2></div>', unsafe_allow_html=True)
        with c2: st.markdown(f'<div class="dark-card"><h4> LEAD TIME CHUẨN</h4><h2>{int(prod_data["Lead_Time_Days"])} Ngày</h2></div>', unsafe_allow_html=True)
        with c3: st.markdown(f'<div class="dark-card"><h4> TỐC ĐỘ BÁN</h4><h2>{int(prod_data["weekly_velocity"])} /Tuần</h2></div>', unsafe_allow_html=True)
        with c4: st.markdown(f'<div class="dark-card"><h4> GIA CÔNG</h4><h2>{"Dễ" if prod_data["complexity_status"]=="B" else "Khó"}</h2></div>', unsafe_allow_html=True)

        col_main, col_side = st.columns([2.5, 1])
        
        with col_main:
            with st.container(border=True):
                st.markdown("<h3 style='color: var(--text-color); margin-bottom: 20px; border-bottom: 2px solid rgba(150, 160, 170, 0.2); padding-bottom: 10px;'> Bộ Giả Lập Kịch Bản (Simulator)</h3>", unsafe_allow_html=True)
                
                tab_coban, tab_nangcao = st.tabs(["🛒 Thông Số Cơ Bản", "⚙️ Tinh Chỉnh Nâng Cao"])
                
                with tab_coban:
                    c_in1, c_in2 = st.columns(2)
                    price = c_in1.number_input("Giá bán giả lập ($)", value=float(prod_data["price"]), format="%.2f")
                    month = c_in1.slider("Mùa vụ (Tháng nhập hàng)", 1, 12, 11)
                    
                    current_stock = c_in1.number_input(" Tồn kho hiện có (Cái)", value=int(st.session_state.auto_stock), min_value=0, step=100)
                    weekly_vel_base = c_in2.number_input("Sức bán nền tảng (cái/tuần)", value=float(prod_data["weekly_velocity"]))
                    lead_time = c_in2.number_input("Lead Time dự kiến (Ngày)", value=int(prod_data["Lead_Time_Days"]))
                    
                with tab_nangcao:
                    c_in3, c_in4 = st.columns(2)
                    comp_index = 0 if prod_data["complexity_status"] == "B" else 1
                    complexity_name = c_in3.selectbox("Độ khó gia công", ["Basic (Dễ may)", "Complex (Khó may)"], index=comp_index)
                    complexity_val = 0 if complexity_name == "Basic (Dễ may)" else 1
                    
                    holding_cost = c_in3.number_input("Chi phí lưu kho/tháng", value=float(prod_data["price"] * 0.0125), format="%.4f")
                    events = {1:2, 2:1, 3:2, 4:2, 5:2, 6:1, 7:1, 8:1, 9:1, 10:1, 11:3, 12:3}.get(month, 1)
                    event_count = c_in4.number_input("Số ngày Lễ/Flash Sale", value=events)
                    
                    is_promo = c_in4.selectbox("Áp dụng giảm giá?", ["Không", "Có"])
                    is_discount_val = 1 if is_promo == "Có" else 0

                st.markdown("---")
                store_scale = st.number_input(" Quy mô mạng lưới (Số điểm bán)", value=1, min_value=1, max_value=5000, step=10)
                st.markdown("<br>", unsafe_allow_html=True)

                if st.button(" KÍCH HOẠT HỆ THỐNG AI TÍNH TOÁN", use_container_width=True):
                    with st.spinner(" Đang chạy mô phỏng thời gian thực..."):
                        # ==========================================
                        # ĐỒNG BỘ LOGIC TOÁN HỌC NHƯ BÊN BACKEND (CÓ GUARDRAIL)
                        # ==========================================
                        in1 = pd.DataFrame([[price, complexity_val, weekly_vel_base, month, event_count, is_discount_val]], 
                                           columns=['price_mean', 'complexity_status_num', 'weekly_velocity', 'month', 'event_sales_count', 'is_discounted'])
                        raw_ai_demand = max(0, model_1_demand.predict(in1)[0]) if model_1_demand else weekly_vel_base * 4 
                        
                        boost_factor = 1.0 + (event_count * 0.05) + (is_discount_val * 0.15)
                        logical_min_demand = (weekly_vel_base * 4) * boost_factor
                        base_demand = max(raw_ai_demand, logical_min_demand)
                        
                        in2 = pd.DataFrame([[price, lead_time, holding_cost, complexity_val, 0, base_demand/4]],
                                           columns=['price', 'Lead_Time_Days', 'Holding_Cost_Monthly', 'complexity_status_num', 'day_category_num', 'weekly_velocity'])
                        base_inv = max(0, model_2_inventory.predict(in2)[0]) if model_2_inventory else base_demand * 1.5 
                        
                        # 🔥 THÊM GUARDRAIL BẢO VỆ CHỐNG CHÁY KHO (INVENTORY GUARDRAIL) 🔥
                        min_safe_inv = base_demand * 1.2
                        base_inv = max(base_inv, min_safe_inv)
                        
                        demand_pred = base_demand * store_scale
                        target_inventory = base_inv * store_scale 
                        
                        order_qty = max(0, target_inventory - current_stock) 
                        end_inventory = max(0, current_stock + order_qty - demand_pred) 
                        
                        st.session_state.auto_stock = end_inventory
                        
                        st.markdown("---")
                        st.markdown(f"####  KẾT QUẢ DỰ BÁO CHO <span style='color:#CC0000;'>{store_scale}</span> CỬA HÀNG", unsafe_allow_html=True)
                        
                        r1, r2, r3, r4 = st.columns(4)
                        r1.metric(" NHU CẦU DỰ BÁO", f"{int(demand_pred):,} SP", delta=f"Tháng {month}")
                        r2.metric(" MỨC KHO AN TOÀN", f"{int(target_inventory):,} SP", delta="AI Khuyến nghị", delta_color="off")
                        if order_qty == 0: r3.metric(" LỆNH NHẬP MỚI", "0 SP", delta="Kho dư sức bán!", delta_color="normal")
                        else: r3.metric(" LỆNH NHẬP MỚI", f"{int(order_qty):,} SP", delta=f"Trừ {int(current_stock)} SP tồn cũ", delta_color="inverse")
                        r4.metric(" TỒN CUỐI KỲ", f"{int(end_inventory):,} SP", delta="Dư mang sang tháng sau", delta_color="normal")
                        
                        if base_demand > raw_ai_demand:
                            st.warning(f" **Business Guardrail:** AI thuật toán gốc dự báo rủi ro thiếu hụt. Hệ thống tự động ghi đè bằng quy tắc an toàn.")
                        
                        st.markdown("<br>", unsafe_allow_html=True)
                        st.markdown("#####  Phân tích Dòng chảy Tồn kho (AI Logic)")

                        fig_waterfall = go.Figure(go.Waterfall(
                            name = "Flow", orientation = "v",
                            measure = ["absolute", "relative", "total", "relative", "total"],
                            x = ["Tồn đầu kỳ", "+ Lệnh Nhập", "= TỔNG CÓ SẴN", "- Khách mua", "= Tồn cuối kỳ"],
                            textposition = "outside",
                            text = [f"{int(current_stock)}", f"+{int(order_qty)}", f"{int(current_stock + order_qty)}", f"-{int(demand_pred)}", f"{int(end_inventory)}"],
                            y = [current_stock, order_qty, current_stock + order_qty, -demand_pred, end_inventory],
                            connector = {"line":{"color":"rgba(150,160,170,0.5)"}},
                            increasing = {"marker":{"color":"#38BDF8"}}, 
                            decreasing = {"marker":{"color":"#FB7185"}}, 
                            totals = {"marker":{"color":"#475569"}} 
                        ))
                        fig_waterfall.update_layout(showlegend = False, height=350, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', margin=dict(t=20, b=10, l=10, r=10))
                        fig_waterfall.update_yaxes(showgrid=True, gridwidth=1, gridcolor='rgba(150,160,170,0.2)')
                        st.plotly_chart(fig_waterfall, use_container_width=True, config={'displayModeBar': False}, theme="streamlit")

        with col_side:
            with st.expander(" HIỆU SUẤT HỆ THỐNG AI", expanded=True):
                fig_ring1 = go.Figure(data=[go.Pie(values=[REAL_DEMAND_ACCURACY, 100 - REAL_DEMAND_ACCURACY], hole=0.82, marker_colors=["#38BDF8", "#334155"], textinfo='none', hoverinfo='none', sort=False)])
                fig_ring1.update_layout(showlegend=False, height=180, margin=dict(l=0, r=0, t=10, b=0), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", annotations=[dict(text=f"{REAL_DEMAND_ACCURACY}%", x=0.5, y=0.55, font_size=42, font_color="#FFFFFF", font_family="Arial Black", showarrow=False), dict(text="ĐỘ TIN CẬY AI (DEMAND)", x=0.5, y=0.28, font_size=10, font_color="#94A3B8", font_weight="bold", showarrow=False)])
                st.plotly_chart(fig_ring1, use_container_width=True, config={'displayModeBar': False})

                st.markdown("<br>", unsafe_allow_html=True)
                
                fig_ring2 = go.Figure(data=[go.Pie(values=[REAL_INVENTORY_ACCURACY, 100 - REAL_INVENTORY_ACCURACY], hole=0.82, marker_colors=["#FB7185", "#334155"], textinfo='none', hoverinfo='none', sort=False)])
                fig_ring2.update_layout(showlegend=False, height=180, margin=dict(l=0, r=0, t=0, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", annotations=[dict(text=f"{REAL_INVENTORY_ACCURACY}%", x=0.5, y=0.55, font_size=42, font_color="#FFFFFF", font_family="Arial Black", showarrow=False), dict(text="ĐỘ CHÍNH XÁC TỒN KHO", x=0.5, y=0.28, font_size=10, font_color="#94A3B8", font_weight="bold", showarrow=False)])
                st.plotly_chart(fig_ring2, use_container_width=True, config={'displayModeBar': False})

            st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
            
            # --- THANH TRƯỢT CHỨA CON ROBOT VÀ NÚT CHAT BÊN TRONG ĐỂ KHÔNG TÁCH KHUNG ---
            with st.expander("🤖 AI ASSISTANT", expanded=True):
                components.html("""
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                    body { margin: 0; background-color: transparent; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                    .robot-container { perspective: 800px; margin-top: -10px; }
                    #custom-robot { width: 140px; filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.4)); transition: transform 0.1s ease-out; display: block; }
                    h4 { color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 8px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; }
                    .status { display: flex; align-items: center; gap: 6px; }
                    .dot { width: 8px; height: 8px; background-color: #00F2FF; border-radius: 50%; box-shadow: 0 0 8px #00F2FF; animation: pulse 2s infinite; }
                    .text { color: #94A3B8; font-size: 12px; font-weight: 500; }
                    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                </style>
                </head>
                <body>
                    <div class="robot-container">
                        <img id="custom-robot" src="https://i.postimg.cc/13fWPT90/Screenshotkk-2026-03-13-224827-removebg-preview.png" alt="AI Robot">
                    </div>
                    <h4> AI ASSISTANT</h4>
                    <div class="status">
                        <div class="dot"></div>
                        <div class="text">Core Online</div>
                    </div>
                    <script>
                        const robot = document.getElementById('custom-robot');
                        function updateLook(mouseX, mouseY, anchorX, anchorY) {
                            const deltaX = mouseX - anchorX;
                            const deltaY = mouseY - anchorY;
                            const rotateX = Math.max(-20, Math.min(20, -deltaY / 12));
                            const rotateY = Math.max(-20, Math.min(20, deltaX / 12));
                            robot.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                        }
                        try {
                            window.parent.document.addEventListener('mousemove', (e) => {
                                const iframe = window.frameElement;
                                const rect = iframe ? iframe.getBoundingClientRect() : {left: 0, top: 0, width: 200};
                                const anchorX = rect.left + rect.width / 2;
                                const anchorY = rect.top + 70; 
                                updateLook(e.clientX, e.clientY, anchorX, anchorY);
                            });
                        } catch(err) {
                            document.addEventListener('mousemove', (e) => {
                                const rect = document.body.getBoundingClientRect();
                                const anchorX = rect.width / 2;
                                const anchorY = 70;
                                updateLook(e.clientX, e.clientY, anchorX, anchorY);
                            });
                        }
                    </script>
                </body>
                </html>
                """, height=190)

                st.markdown("<hr style='border-color: #334155; margin: 0px 0 15px 0;'>", unsafe_allow_html=True)
                
                if "show_chat" not in st.session_state:
                    st.session_state.show_chat = False
                
                def toggle_chat():
                    st.session_state.show_chat = not st.session_state.show_chat
                
                st.button(
                    " MỞ KHUNG CHAT AI" if not st.session_state.show_chat else " ĐÓNG KHUNG CHAT", 
                    on_click=toggle_chat, 
                    use_container_width=True
                )
                
                if st.session_state.show_chat:
                    if "mini_messages" not in st.session_state:
                        st.session_state.mini_messages = [
                            {"role": "assistant", "content": "Dạ em chào anh Minh ạ! Cần em kiểm tra mã hàng nào hôm nay?"}
                        ]

                    chat_container = st.container(height=300)
                    with chat_container:
                        for msg in st.session_state.mini_messages:
                            with st.chat_message(msg["role"]):
                                st.write(msg["content"])

                    if prompt := st.chat_input("Hỏi AI..."):
                        st.session_state.mini_messages.append({"role": "user", "content": prompt})
                        with chat_container:
                            with st.chat_message("user"):
                                st.write(prompt)

                            with st.chat_message("assistant"):
                                chao_hoi = ["chào", "chao", "hello", "hi", "xin chào"]
                                if any(word in prompt.lower() for word in chao_hoi) and len(prompt) < 20:
                                    answer = "Dạ em chào anh Minh ạ! Cần em kiểm tra mã hàng nào hôm nay?"
                                    st.write(answer)
                                    st.session_state.mini_messages.append({"role": "assistant", "content": answer})
                                else:
                                    with st.spinner("Đang tính..."):
                                        if agent:
                                            try:
                                                response = agent.invoke({"input": prompt}) 
                                                answer = response["output"]
                                                st.write(answer)
                                                st.session_state.mini_messages.append({"role": "assistant", "content": answer})
                                            except Exception as e:
                                                error_msg = "Google API đang quá tải. Anh đợi 30 giây nhé!"
                                                st.error(error_msg)
                                                st.session_state.mini_messages.append({"role": "assistant", "content": error_msg})
                                        else:
                                            st.error("⚠️ Lỗi dữ liệu.")

elif selected == "Tra cứu hệ thống":
    st.markdown("<h2 style='color: var(--text-color);'> Database Trung Tâm</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color: var(--text-color); opacity: 0.7;'>Bảng xem trước dữ liệu của **100 sản phẩm bán chạy nhất** được trích xuất từ Big Data của H&M.</p>", unsafe_allow_html=True)
    try:
        # Cập nhật thẳng luôn
        df_show = pd.read_csv('top_100_products.csv', encoding='utf-8-sig')
        st.dataframe(df_show, use_container_width=True, height=600)
    except FileNotFoundError: st.error(" Không tìm thấy file `top_100_products.csv`.")
    except Exception as e: st.error(f" Lỗi hệ thống: {e}")

elif selected == "Cài đặt Admin":
    st.markdown("<h1 style='color: var(--text-color);'> System Architecture</h1>", unsafe_allow_html=True)
    st.info("Bảng điều khiển máy chủ và quản lý API đang được bảo trì.")
    st.write("Trạng thái Model:")
    st.success(f"Model Demand: {REAL_DEMAND_ACCURACY}%")
    st.success(f"Model Inventory: {REAL_INVENTORY_ACCURACY}%")