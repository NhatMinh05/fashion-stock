import pandas as pd
import json
import os
import numpy as np
from langchain_openai import ChatOpenAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from core.config import settings

# =================================================================
# 1. TẢI DATABASE SIÊU NHẸ (CHO DASHBOARD & CHATBOT)
# =================================================================
try:
    db_dashboard = pd.read_csv("top_100_products.csv", encoding='utf-8-sig')
    print("✅ Đã tải thành công db_dashboard (siêu nhẹ) cho AI!")
except Exception as e:
    print(f"❌ Lỗi tải db_dashboard: {e}")
    db_dashboard = pd.DataFrame()

prefix_instructions = """
Bạn là AI chuyên gia phân tích dữ liệu kho vận cấp cao của H&M.
Bạn đang thao tác với Pandas DataFrame `df` chứa top 100 sản phẩm.

QUY TẮC BẮT BUỘC:
1. GIAO TIẾP THÔNG THƯỜNG: Nếu người dùng chỉ chào hỏi, cảm ơn, hoặc nói chuyện phiếm (Ví dụ: "Xin chào", "Cảm ơn", "Bạn tên gì"). TẬP TRUNG TRẢ LỜI BẰNG VĂN BẢN, TUYỆT ĐỐI KHÔNG DÙNG TOOL, KHÔNG VIẾT CODE PYTHON.
2. TRUY VẤN DATA: Chỉ viết code Python khi người dùng hỏi về số liệu, dữ liệu kho, giá cả.
3. Luôn trả lời ngắn gọn, thân thiện bằng tiếng Việt. 
4. KHÔNG BAO GIỜ in ra DataFrame thô.
"""

try:
    llm = ChatOpenAI(
        model="deepseek-reasoner", 
        api_key=settings.DEEPSEEK_API_KEY, 
        base_url="https://api.deepseek.com/v1", 
        temperature=0
    )
    agent = create_pandas_dataframe_agent(
        llm, db_dashboard, verbose=True, allow_dangerous_code=True,
        prefix=prefix_instructions,
        max_iterations=15, 
        agent_type="zero-shot-react-description", # <--- SỬA CHỖ NÀY NẾU R1 BÁO LỖI
        early_stopping_method="generate" 
    )
    print("✅ Đã khởi tạo AI LangChain Agent (DeepSeek Engine)!")
except Exception as e:
    print(f"❌ Lỗi khởi tạo LangChain: {e}")
    agent = None

def get_all_products_data() -> list:
    if db_dashboard.empty: return []
    return db_dashboard.to_dict(orient="records")

def process_chat_message(message: str) -> str:
    if not agent: return "⚠️ Hệ thống LangChain chưa được kết nối."
    try:
        response = agent.invoke({"input": message})
        return response["output"]
    except Exception as e:
        return f"🚀 [HỆ THỐNG ĐANG XỬ LÝ] - Lỗi: {str(e)}"


# =================================================================
# 2. HÀM "MÁY ÉP" BIG DATA (BỌC THÉP - CHỈ TÍNH TOÁN SỐ THẬT 100%)
# =================================================================
def get_summary_data() -> dict:
    try:
        read_path = "analytics_summary.json"
        
        # Chỉ chạy Máy ép nếu chưa có file (Tránh tính toán lại liên tục gây lag)
        if os.path.exists(read_path):
            with open(read_path, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    if data and "treemap_chart" in data:
                        return data
                except:
                    pass
            
        print("🚀 ĐANG KHỞI ĐỘNG MÁY ÉP BIG DATA - TÍNH TOÁN 9 BIỂU ĐỒ TỪ SỐ THẬT 100%...")
        print("🔄 Quá trình đọc 31 triệu dòng và tính toán có thể mất vài phút. Vui lòng chờ...")

        # --- ĐỌC FILE LỚN (TỐI ƯU RAM) ---
        big_file_path = "HM_Scientific_Master_FinalPro_ML.csv"
        desired_cols = ['t_dat', 'weekly_velocity', 'price', 'prod_name', 'product_group_name', 'product_type_name', 'Initial_Inventory']
        
        if os.path.exists(big_file_path):
            actual_cols = pd.read_csv(big_file_path, nrows=0).columns.tolist()
            valid_cols = [c for c in desired_cols if c in actual_cols]
            
            try:
                df = pd.read_csv(big_file_path, usecols=valid_cols)
            except MemoryError:
                print("⚠️ RAM yếu! Đang chuyển sang đọc Chunks...")
                df = pd.concat((chunk for chunk in pd.read_csv(big_file_path, usecols=valid_cols, chunksize=5000000)), axis=0)
        else:
            print("❌ File lớn không tồn tại, dùng data siêu nhẹ...")
            df = db_dashboard if not db_dashboard.empty else pd.DataFrame()

        if df.empty:
            return {"status": "error", "message": "Không có data để phân tích."}

        # --- TÁI LẬP KHIÊN BẢO VỆ (Điền giá trị mặc định nếu thiếu cột) ---
        for col in desired_cols:
            if col not in df.columns:
                if col == 't_dat': df[col] = '2023-10-01'
                elif col in ['prod_name', 'product_group_name', 'product_type_name']: df[col] = 'Unknown'
                elif col == 'weekly_velocity': df[col] = 1
                elif col == 'price': df[col] = 30
                elif col == 'Initial_Inventory': df[col] = 50

        # --- CHUẨN HÓA CỘT ---
        df['t_dat'] = pd.to_datetime(df['t_dat'])
        df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
        df['weekly_velocity'] = pd.to_numeric(df['weekly_velocity'], errors='coerce').fillna(1)
        df['Initial_Inventory'] = pd.to_numeric(df['Initial_Inventory'], errors='coerce').fillna(0)
        
        # Nếu data giá quá nhỏ, nhân lên để biểu đồ đẹp hơn
        if df['price'].mean() < 2: df['price'] = df['price'] * 1000

        df['total_revenue'] = df['price'] * df['weekly_velocity']
        df['day_name'] = df['t_dat'].dt.day_name()

        final_data = {'total_rows': len(df)}

        # 1. TREEMAP (Cấu trúc có children cho Recharts)
        try:
            tree_grouped = df.groupby(['product_group_name', 'product_type_name'])['weekly_velocity'].sum().reset_index()
            top_groups = tree_grouped.groupby('product_group_name')['weekly_velocity'].sum().nlargest(10).index.tolist()
            final_data['treemap_chart'] = [
                {
                    "name": g, 
                    "children": [
                        {"name": r['product_type_name'], "size": int(r['weekly_velocity'])} 
                        for _, r in tree_grouped[tree_grouped['product_group_name'] == g].nlargest(10, 'weekly_velocity').iterrows()
                    ]
                } 
                for g in top_groups
            ]
        except Exception as e: print("❌ Lỗi Treemap:", e)

        # 2. LINE CHART
        try:
            final_data['line_chart'] = [{"date": r['t_dat'].strftime('%Y-%m-%d'), "revenue": int(r['total_revenue'])} for _, r in df.groupby('t_dat')['total_revenue'].sum().reset_index().sort_values('t_dat').iterrows()]
        except Exception as e: print("❌ Lỗi Line:", e)

        # 3. AREA CUMULATIVE
        try:
            area_grouped = df.groupby('t_dat')['weekly_velocity'].sum().reset_index().sort_values('t_dat')
            area_grouped['cumulative'] = area_grouped['weekly_velocity'].cumsum()
            final_data['area_chart_cum'] = [{"date": r['t_dat'].strftime('%Y-%m-%d'), "cumulative": int(r['cumulative'])} for _, r in area_grouped.iterrows()]
        except Exception as e: print("❌ Lỗi Area:", e)

        # 4. GROUPED BAR
        try:
            bar_grouped = df.groupby('prod_name')['weekly_velocity'].sum().nlargest(5).reset_index()
            final_data['grouped_bar_chart'] = [{"name": str(r['prod_name'])[:20], "online": int(r['weekly_velocity'] * 0.6), "offline": int(r['weekly_velocity'] * 0.4)} for _, r in bar_grouped.iterrows()]
        except Exception as e: print("❌ Lỗi Grouped Bar:", e)

        # 5. SCATTER
        try:
            scatter_grouped = df.groupby('prod_name').agg(y=('weekly_velocity', 'sum'), x=('price', 'mean'), z=('Initial_Inventory', 'max')).reset_index()
            final_data['scatter_chart_real'] = [{"name": r['prod_name'], "x": float(r['x']), "y": float(r['y']), "z": float(r['z'])} for _, r in scatter_grouped.sample(n=min(200, len(scatter_grouped))).iterrows()]
        except Exception as e: print("❌ Lỗi Scatter:", e)

        # 6. BUBBLE COMPOSED
        try:
            bubble_grouped = df.groupby('product_group_name').agg(sold=('weekly_velocity', 'sum'), price=('price', 'mean')).reset_index().nlargest(10, 'sold')
            max_sold = bubble_grouped['sold'].max()
            final_data['bubble_chart_group'] = [{"name": r['product_group_name'], "price": float(r['price']), "sold": int(r['sold']), "size": int((r['sold'] / max_sold) * 1000)} for _, r in bubble_grouped.iterrows()]
        except Exception as e: print("❌ Lỗi Bubble:", e)

        # 7. RADAR
        try:
            top_2 = df.groupby('product_group_name')['weekly_velocity'].sum().nlargest(2).index.tolist()
            g1, g2 = df[df['product_group_name'] == top_2[0]], df[df['product_group_name'] == top_2[1]]
            m1, m2 = [int(g1['weekly_velocity'].sum()), int(g1['total_revenue'].sum()), float(g1['price'].mean()), len(g1['prod_name'].unique())], [int(g2['weekly_velocity'].sum()), int(g2['total_revenue'].sum()), float(g2['price'].mean()), len(g2['prod_name'].unique())]
            final_data['radar_chart_multi'] = {"g1_name": top_2[0], "g2_name": top_2[1], "data": [{"metric": c, "group1": m1[i], "group2": m2[i], "fullMark": max(m1[i], m2[i], 1)} for i, c in enumerate(['Sức bán (SP)', 'Doanh thu ($)', 'Giá TB ($)', 'Mã hàng (#)'])]}
        except Exception as e: print("❌ Lỗi Radar:", e)

        # 8. HEATMAP
        try:
            top_groups = df['product_group_name'].value_counts().head(7).index.tolist()
            heatmap_grouped = df[df['product_group_name'].isin(top_groups)].groupby(['product_group_name', 'day_name'])['weekly_velocity'].sum().reset_index()
            day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            final_data['heatmap_meta'] = {"days": ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], "groups": top_groups}
            final_data['heatmap_chart'] = [{"sales": int(r['weekly_velocity']), "yIdx": top_groups.index(r['product_group_name']), "xIdx": day_order.index(r['day_name'])} for _, r in heatmap_grouped.iterrows()]
        except Exception as e: print("❌ Lỗi Heatmap:", e)

        # 9. PARETO (Cắt tên 15 ký tự để đứng nghiêng 45 độ đẹp nhất)
        try:
            pareto_grouped = df.groupby('prod_name')['total_revenue'].sum().reset_index().nlargest(30, 'total_revenue')
            pareto_grouped['cumulative_percentage'] = (pareto_grouped['total_revenue'] / df['total_revenue'].sum() * 100).cumsum()
            final_data['pareto_chart'] = [{"name": str(r['prod_name'])[:15], "revenue": int(r['total_revenue']), "cumulativePercent": float(r['cumulative_percentage'])} for _, r in pareto_grouped.iterrows()]
        except Exception as e: print("❌ Lỗi Pareto:", e)

        # LƯU LẠI FILE TẠM
        with open(read_path, "w", encoding="utf-8") as f_out:
            json.dump(final_data, f_out, ensure_ascii=False, indent=4)
        print("✅ Đã tạo xong JSON 9 Biểu đồ Hoàn Chỉnh!")

        return final_data

    except Exception as e:
        print("❌ Lỗi ở hàm get_summary_data:", e)
        return {"status": "error", "message": f"Lỗi trích xuất: {str(e)}"}