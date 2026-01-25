import json
import pandas as pd
import os

# ================= 🔧 配置区域 =================
PRODUCTS_JSON = 'data/products_ready.json'
CSV_FILE = 'dede_addonshop.csv'
IMAGES_DIR = 'public/images/products'
# ==============================================

def main():
    print("Start syncing litpic1-4 from CSV to product gallery...")

    # 1. 加载现有产品数据
    if not os.path.exists(PRODUCTS_JSON):
        print(f"❌ 错误: 找不到 {PRODUCTS_JSON}")
        return
    
    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    # 2. 加载 CSV 数据
    if not os.path.exists(CSV_FILE):
        print(f"Error: File not found {CSV_FILE}")
        return

    try:
        # 尝试 UTF-8 读取
        df = pd.read_csv(CSV_FILE, encoding='utf-8')
    except:
        # 失败则尝试 GB18030 (DedeCMS 常见编码)
        print("UTF-8 failed, trying GB18030...")
        df = pd.read_csv(CSV_FILE, encoding='gb18030')
    
    # 3. 建立查找字典 (aid -> row)
    # 确保 'aid' 是字符串，以便与 JSON 中的 ID 匹配
    df['aid'] = df['aid'].astype(str)
    addon_map = df.set_index('aid').to_dict('index')
    
    print(f"Loaded CSV records: {len(addon_map)}")

    updated_count = 0
    total_images_added = 0
    
    # 4. 遍历产品并更新
    for product in products:
        p_id = str(product.get('id'))
        
        if p_id in addon_map:
            row = addon_map[p_id]
            
            # 获取现有相册
            gallery = product.get('gallery', [])
            if not isinstance(gallery, list):
                gallery = []
            
            # 需要检查的列
            target_cols = ['litpic1', 'litpic2', 'litpic3', 'litpic4']
            
            images_to_add = []
            
            for col in target_cols:
                path = str(row.get(col, ''))
                
                # 基础验证：非空且非 nan
                if path and path.lower() != 'nan' and path.strip() != '':
                    # 提取文件名 (处理可能存在的 URL 参数)
                    filename = os.path.basename(path).split('?')[0]
                    
                    # 检查本地文件是否存在
                    local_path = os.path.join(IMAGES_DIR, filename)
                    
                    if os.path.exists(local_path):
                        # 构建 Web 路径
                        web_path = f"/images/products/{filename}"
                        
                        # 避免重复 (检查是否已在相册中，或是否是主图)
                        # 注意：这里要做更严格的去重，防止 web_path 已经存在于 gallery 中
                        if web_path not in gallery and web_path != product.get('mainImage'):
                            images_to_add.append(web_path)
            
            if images_to_add:
                gallery.extend(images_to_add)
                product['gallery'] = gallery
                updated_count += 1
                total_images_added += len(images_to_add)
                # print(f"✅ 产品 {p_id}: 新增 {len(images_to_add)} 张图片")

    # 5. 保存更改
    if updated_count > 0:
        with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"\nSuccess! Updated {updated_count} products.")
        print(f"Total images added: {total_images_added}")
    else:
        print("\nNo new images found to add.")

if __name__ == "__main__":
    main()

