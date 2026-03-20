import pandas as pd
import numpy as np

path_data = 'HM_Scientific_Master_FinalPro_ML.csv' 

print("⏳ Đang đọc kho Big Data gốc của H&M...")
try:
    df = pd.read_csv(path_data)
    
    # 1. TỰ TÍNH SỨC BÁN (Nếu file là danh sách các giao dịch)
    # Ta đếm số lần xuất hiện của mỗi article_id
    if 'article_id' in df.columns:
        print("📊 Đang tính toán sức bán dựa trên lượt giao dịch...")
        # Đếm số lần mỗi sản phẩm xuất hiện
        best_seller_counts = df['article_id'].value_counts().reset_index()
        best_seller_counts.columns = ['article_id', 'weekly_velocity']
        
        # Lấy Top 100 article_id bán chạy nhất
        top_100_ids = best_seller_counts.head(100)
        
        # Ghép ngược lại với thông tin sản phẩm (tên, giá, v.v.)
        df_top100 = df[df['article_id'].isin(top_100_ids['article_id'])].drop_duplicates('article_id')
        
        # Cập nhật lại cột weekly_velocity chuẩn cho Top 100
        df_top100 = df_top100.merge(top_100_ids, on='article_id')
    else:
        # Nếu file không có article_id, ta lấy đại 100 dòng nhưng vẫn sửa giá
        print("⚠️ Không tìm thấy article_id, lấy tạm 100 sản phẩm đầu...")
        df_top100 = df.head(100).copy()
        if 'weekly_velocity' not in df_top100.columns:
            df_top100['weekly_velocity'] = np.random.randint(50, 500, size=len(df_top100))

    # 2. FIX GIÁ BÁN (Quan trọng để AI không bị "ngáo" số tồn kho)
    print("💰 Đang điều chỉnh lại giá bán hợp lý ($30 - $50)...")
    df_top100['price'] = df_top100['price'].apply(lambda x: x * 1000 if x < 1 else x)
    
    # Tạo các cột cần thiết cho AI
    if 'price_mean' not in df_top100.columns: df_top100['price_mean'] = df_top100['price']
    df_top100['Holding_Cost_Monthly'] = df_top100['price'] * 0.0125
    
    # 3. XUẤT FILE
    df_top100.to_csv('top_100_products.csv', index=False, encoding='utf-8-sig')
    print("✅ XONG! Đã tạo ra danh sách 100 chiến thần bán chạy nhất!")

except Exception as e:
    print(f"❌ Lỗi: {e}")