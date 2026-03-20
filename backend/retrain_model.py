import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split

print("🚀 BẮT ĐẦU QUY TRÌNH LÀM SẠCH DỮ LIỆU VÀ HUẤN LUYỆN LẠI AI...")

# ==========================================
# 1. ĐỌC VÀ LÀM SẠCH DỮ LIỆU (FIX GIÁ BÁN)
# ==========================================
# Đọc file 100 sản phẩm (Hoặc bạn có thể đổi tên thành file CSV gốc của bạn)
file_name = 'top_100_products.csv'
df = pd.read_csv(file_name, encoding='utf-8-sig')

# 🛠️ THUẬT TOÁN SỬA GIÁ: 
# Những sản phẩm nào giá < $1 (ví dụ $0.03), ta sẽ nhân lên 1000 lần (thành $30) để đúng với thực tế H&M
df['price'] = df['price'].apply(lambda x: x * 1000 if x < 1 else x)

# Sửa luôn cột price_mean nếu có
if 'price_mean' in df.columns:
    df['price_mean'] = df['price_mean'].apply(lambda x: x * 1000 if x < 1 else x)
else:
    df['price_mean'] = df['price']

# Tính lại chi phí lưu kho thực tế với giá mới (1.25% giá trị)
df['Holding_Cost_Monthly'] = df['price'] * 0.0125

# Lưu đè lại file CSV đã sửa giá để Frontend hiển thị cho đẹp
df.to_csv('top_100_products.csv', index=False, encoding='utf-8-sig')
print("✅ Đã sửa giá bán hợp lý và cập nhật file CSV!")

# ==========================================
# 2. TẠO DỮ LIỆU GIẢ LẬP ĐỂ TRAIN (Nếu file CSV chưa có cột Target)
# ==========================================
# Cột Target 1: Nhu cầu thực tế (Demand)
if 'monthly_demand' not in df.columns:
    df['month'] = 11
    df['event_sales_count'] = 2
    df['is_discounted'] = 0
    # Nhu cầu = Sức bán 1 tuần * 4 + nhiễu ngẫu nhiên
    df['monthly_demand'] = (df['weekly_velocity'] * 4) * np.random.uniform(0.9, 1.2, len(df))

# Cột Target 2: Tồn kho an toàn thực tế (Safety Stock)
if 'target_inventory' not in df.columns:
    df['day_category_num'] = 0
    df['complexity_status_num'] = df['complexity_status'].apply(lambda x: 0 if x == 'B' else 1)
    # Công thức: Tồn kho = Nhu cầu + (Lead time * sức bán ngày) - (Phạt nếu phí lưu kho cao)
    df['target_inventory'] = df['monthly_demand'] + (df['Lead_Time_Days'] * (df['weekly_velocity']/7)) 
    df['target_inventory'] = df['target_inventory'] * np.random.uniform(0.95, 1.1, len(df))

# ==========================================
# 3. HUẤN LUYỆN MODEL 1 (DỰ BÁO NHU CẦU)
# ==========================================
features_1 = ['price_mean', 'complexity_status_num', 'weekly_velocity', 'month', 'event_sales_count', 'is_discounted']
X1 = df[features_1]
y1 = df['monthly_demand']

model_1 = HistGradientBoostingRegressor(max_iter=100, random_state=42)
model_1.fit(X1, y1)

# Lưu Model 1
joblib.dump(model_1, 'model_1_monthly_demand_v3.pkl')
print("✅ Đã train và lưu thành công: model_1_monthly_demand_v3.pkl")

# ==========================================
# 4. HUẤN LUYỆN MODEL 2 (DỰ BÁO TỒN KHO)
# ==========================================
features_2 = ['price', 'Lead_Time_Days', 'Holding_Cost_Monthly', 'complexity_status_num', 'day_category_num', 'weekly_velocity']
X2 = df[features_2]
y2 = df['target_inventory']

model_2 = HistGradientBoostingRegressor(max_iter=100, random_state=42)
model_2.fit(X2, y2)

# Lưu Model 2
joblib.dump(model_2, 'model_2_inventory.pkl')
print("✅ Đã train và lưu thành công: model_2_inventory.pkl")

print("🎉 HOÀN TẤT! HÃY KHỞI ĐỘNG LẠI SERVER FASTAPI ĐỂ TRẢI NGHIỆM AI MỚI!")