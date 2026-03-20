import pandas as pd
import numpy as np
import os
import gc
import holidays
'''
# ==============================================================================
# BƯỚC 1: CẤU HÌNH & ĐỌC DỮ LIỆU (SIÊU TỐI ƯU RAM)
# ==============================================================================
print("[1/6] Đang nạp dữ liệu với chế độ tối ưu bộ nhớ...")

# Định nghĩa kiểu dữ liệu 
dtype_trans = {
    'article_id': 'int32', 
    'price': 'float32', 
    'sales_channel_id': 'int8' 
}
dtype_articles = {
    'article_id': 'int32',
    'product_group_name': 'category' 
}

# Đường dẫn file (Dựa trên đường dẫn cũ của bạn)
path_trans = "D:/Dự án DAP/hm_full_2years_optimized.csv"
path_articles = "D:/Dự án DAP/articles.csv"
path_supply = "D:/Dự án DAP/supply_chain_data.csv"

# Đọc file
df_trans = pd.read_csv(path_trans, dtype=dtype_trans, engine='c') 
df_articles = pd.read_csv(path_articles, usecols=['article_id', 'prod_name', 'product_type_name', 'product_group_name'], dtype=dtype_articles)
df_supply = pd.read_csv(path_supply)

print(f"   -> Đã nạp {len(df_trans):,} dòng giao dịch.")

# ==============================================================================
# BƯỚC 2: GỘP DỮ LIỆU & DỌN DẸP
# ==============================================================================
print("[2/6] Đang hợp nhất dữ liệu...")
df_trans = df_trans.merge(df_articles, on='article_id', how='left')

# Xóa biến thừa ngay lập tức
del df_articles
gc.collect()

# ==============================================================================
# BƯỚC 3 (MỚI): PHÂN LOẠI ĐỘ PHỨC TẠP (COMPLEXITY CLASSIFICATION)
# ==============================================================================
print("[3/6] Đang phân loại sản phẩm (Basic vs Complex)...")

# 1. Định nghĩa danh sách lọc
hard_complex_groups = ['Shoes', 'Garment Full body', 'Bags']
complex_types = [
    'Jacket', 'Coat', 'Blazer', 'Suit', 'Outdoor Waistcoat', 
    'Sweater', 'Cardigan', 'Boots', 'Sneakers', 'Sandals', 
    'Fine knit bra', 'Corset'
]
keywords = ['leather', 'suede', 'sequin', 'embroider', 'cashmere', 'silk', 'wool']
keyword_pattern = '|'.join(keywords) 

# 2. Quét điều kiện Vector
cond_group = df_trans['product_group_name'].isin(hard_complex_groups)
cond_type = df_trans['product_type_name'].isin(complex_types)
cond_keyword = df_trans['prod_name'].astype(str).str.contains(keyword_pattern, case=False, na=False)

# 3. Gán nhãn (C: Complex, B: Basic)
df_trans['complexity_status'] = np.where(cond_group | cond_type | cond_keyword, 'C', 'B')
df_trans['complexity_status'] = df_trans['complexity_status'].astype('category')

print(f"   -> Đã phân loại xong: {df_trans['complexity_status'].value_counts().to_dict()}")

# ==============================================================================
# BƯỚC 4: TRÍCH XUẤT THAM SỐ TỪ SUPPLY CHAIN (BENCHMARKING)
# ==============================================================================
print(" [4/6] Đang học tham số từ dữ liệu Supply Chain...")
# Lead Time trung bình và độ lệch
lt_mean = np.float32(df_supply['Lead times'].mean())
lt_std = np.float32(df_supply['Lead times'].std())

# Weeks of Supply (Hệ số dự trữ)
supply_vals = df_supply['Stock levels'].values
sold_vals = df_supply['Number of products sold'].values
avg_weeks_supply = np.mean(supply_vals / (sold_vals + 1)) #Kĩ thuật Laplace Smoothing (hay Add-One Smoothing)

print(f"   -> Lead Time Mean: {lt_mean:.2f} | Weeks Supply Ratio: {avg_weeks_supply:.2f}")

# ==============================================================================
# BƯỚC 5: FEATURE ENGINEERING & SIÊU LOGIC TỒN KHO (OPTIMIZED FOR ML)
# ==============================================================================
print("🛠️ [5/6] Đang tính toán các chỉ số phức tạp...")

# --- 5.1. Xử lý Thời gian & Sự kiện ---
df_trans['t_dat'] = pd.to_datetime(df_trans['t_dat'])
df_trans['month'] = df_trans['t_dat'].dt.month 

uk_holidays = pd.to_datetime(list(holidays.UK(years=[2018, 2019, 2020]).keys()))
df_trans['is_holiday'] = df_trans['t_dat'].isin(uk_holidays).astype('int8')
df_trans['is_double_day'] = (df_trans['t_dat'].dt.day == df_trans['t_dat'].dt.month).astype('int8')
df_trans['is_weekend'] = (df_trans['t_dat'].dt.dayofweek >= 5).astype('int8')

conditions = [df_trans['is_holiday'] == 1, df_trans['is_double_day'] == 1, df_trans['is_weekend'] == 1]
choices = ['Holiday', 'Double Day', 'Weekend']
df_trans['Day_Category'] = np.select(conditions, choices, default='Normal Day')

# --- 5.2. Lead Time & Holding Cost (LOGIC: GROUPED BY PRODUCT CODE - XỊN HƠN) ---
print("   -> Đang tính Lead Time (Logic: Đồng bộ theo dòng sản phẩm)...")
n_rows = len(df_trans)
# 1. TẠO MÃ CHA (PRODUCT CODE) ĐỂ ĐỒNG BỘ LEAD TIME
# H&M Article ID (9 số) = Product Code (6-7 số đầu) + Color Code (3 số cuối)
# Chia lấy phần nguyên cho 1000 để lấy mã cha
df_trans['product_code'] = (df_trans['article_id'] // 1000).astype('int32')

# 2. TÍNH BASE LEAD TIME (THEO MÃ CHA)
unique_products = df_trans['product_code'].unique()
np.random.seed(42) # Cố định seed để kết quả không đổi khi chạy lại

# Random Lead Time cho từng DÒNG SẢN PHẨM (Các màu sẽ có chung base này)
base_lt_values = np.abs(np.random.normal(lt_mean, lt_std, len(unique_products))).astype('float32')
lt_mapper = pd.Series(base_lt_values, index=unique_products)

# Map Base vào DataFrame dựa trên PRODUCT CODE
df_trans['base_lt_temp'] = df_trans['product_code'].map(lt_mapper)

# 3. TẠO BIẾN ĐỘNG VẬN HÀNH (JITTER/NOISE)
# Tạo độ lệch nhỏ cho từng đơn hàng cụ thể (tăng tính tự nhiên)
operational_noise = np.random.normal(loc=0, scale=1.5, size=len(df_trans)).astype('float32')

# 4. TÍNH LEAD TIME CUỐI CÙNG
# Công thức: Base (theo mẫu) + Phạt (nếu hàng khó) + Nhiễu (ngẫu nhiên)
penalty_series = np.where(df_trans['complexity_status'] == 'C', lt_std, 0).astype('float32')

df_trans['Lead_Time_Days'] = (df_trans['base_lt_temp'] + penalty_series + operational_noise)

# Ràng buộc: Tối thiểu 1 ngày, làm tròn thành số nguyên
df_trans['Lead_Time_Days'] = np.maximum(df_trans['Lead_Time_Days'], 1).round().astype('int16')

# 5. DỌN DẸP RAM (Xóa các cột tạm ngay lập tức)
del lt_mapper, base_lt_values, operational_noise, penalty_series, unique_products
del df_trans['base_lt_temp']
del df_trans['product_code'] 
gc.collect()

# --- Tính Holding Cost ---
holding_rate = np.where(df_trans['complexity_status'] == 'C', 0.25, 0.15).astype('float32')
df_trans['Holding_Cost_Monthly'] = (df_trans['price'] * holding_rate / 12).astype('float32')

print("   -> Đã tính xong Lead Time & Holding Cost (Logic nâng cao).")

# --- 5.3. SIÊU LOGIC TỒN KHO (Đã khôi phục các hệ số thiếu) ---
print("[5/6] Đang tính toán logic tồn kho đa biến...")

# A. Sales Velocity (Số lượng bán/tuần)
velocity_map = df_trans['article_id'].value_counts(sort=False).astype('float32') / 104
df_trans['weekly_velocity'] = df_trans['article_id'].map(velocity_map).fillna(0)

# B. Scale Factor (S) - Đồng bộ quy mô giữa Supply Chain mẫu và H&M
S = np.mean(sold_vals) / velocity_map.mean()

# C. Hệ số Mùa vụ (Seasonality)
winter_items = ['Garment Upper body', 'Garment Full body', 'Garment Lower body'] 
is_winter_month = df_trans['month'].isin([10, 11, 12, 1, 2])
is_summer_month = df_trans['month'].isin([5, 6, 7, 8])
is_winter_prod = df_trans['product_group_name'].isin(winter_items)

season_factor = np.ones(n_rows, dtype='float32')
season_factor = np.where(is_winter_month & is_winter_prod, 1.5, season_factor)
season_factor = np.where(is_summer_month & is_winter_prod, 0.6, season_factor)

# D. Hệ số Rủi ro nhóm hàng (Category Risk)
cat_factor_map = {'Accessories': 1.2, 'Underwear': 1.3, 'Shoes': 1.1}
cat_factor = df_trans['product_group_name'].map(cat_factor_map).fillna(1.0).astype('float32')

# E1. MỚI: Hệ số Ngày đặc biệt (Day Factor) 
day_factor_map = {'Holiday': 1.4, 'Double Day': 1.3, 'Weekend': 1.2, 'Normal Day': 1.0}
df_trans['day_factor'] = df_trans['Day_Category'].map(day_factor_map).astype('float32')

# E2. Safety Stock (SS) dựa trên Lead_Time_Days thực tế
df_trans['SS'] = (1.65 * np.sqrt(df_trans['weekly_velocity']) * np.sqrt(df_trans['Lead_Time_Days'] / 7)).astype('float32')


# F. CÔNG THỨC TỒN KHO TỔNG HỢP (ĐÃ SỬA)
noise = np.random.uniform(0.9, 1.1, n_rows).astype('float32')

# Thêm biến df_trans['day_factor'] vào chuỗi phép nhân
inv_values = (
    df_trans['weekly_velocity'] * avg_weeks_supply * S * season_factor * cat_factor * df_trans['day_factor'] * # <--- CHÍNH LÀ CÁI NÀY
    noise + df_trans['SS'])

# Làm tròn và chặn dưới 20
df_trans['Initial_Inventory'] = np.maximum(inv_values, 20).round().astype('int32')

# ==============================================================================
# BƯỚC 6: XUẤT FILE & KIỂM TRA (ĐÃ FIX LỖI ĐƯỜNG DẪN)
# ==============================================================================
# 1. Đặt một đường dẫn duy nhất cho cả việc lưu và đọc
output_path = "D:/Dự án DAP/HM_Scientific_Master_FinalPro_ML.csv"

print(f"[6/6] Đang lưu file '{output_path}'...")

# 2. Định nghĩa các cột cần xuất (Đảm bảo có complexity_status cho ML)
final_cols = ['t_dat', 'article_id', 'prod_name', 'product_type_name', 'product_group_name',
              'complexity_status', 'price', 'Lead_Time_Days', 'Holding_Cost_Monthly', 
              'Initial_Inventory', 'Day_Category']

# 3. Lưu file
df_trans[final_cols].to_csv(output_path, index=False)
print("🎉 THÀNH CÔNG! Dữ liệu đã sẵn sàng.")
'''
df = pd.read_csv(r'D:\Dự án DAP\HM_Scientific_Master_FinalPro_ML.csv')
print(df.head(10))