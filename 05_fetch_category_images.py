import pandas as pd
import requests
import os
import json
import time
from urllib.parse import urljoin

# ================= 🔧 配置区域 =================
ARCTYPE_CSV = "dede_arctype.csv" 
BASE_URL = "https://www.fhopepack.com"
IMAGE_SAVE_DIR = "public/images/categories"
OUTPUT_JSON = "data/categories_enriched.json"
# ==============================================

def download_image(img_path, save_dir):
    """下载图片并返回新的本地路径"""
    # 1. 基础清洗：如果是空值或nan
    if not img_path or pd.isna(img_path) or str(img_path).lower() == 'nan':
        return None
    
    img_path = str(img_path).strip()
    if not img_path:
        return None
    
    # 2. 补全相对路径
    if not img_path.startswith('/'):
        img_path = '/' + img_path
        
    full_url = urljoin(BASE_URL, img_path)
    filename = os.path.basename(img_path)
    
    # 3. 简单的文件名清洗（去掉可能导致报错的字符）
    filename = filename.split('?')[0] # 去掉URL参数
    
    local_path = os.path.join(save_dir, filename)
    public_path = f"/images/categories/{filename}" 

    # 4. 如果文件已存在，直接返回
    if os.path.exists(local_path):
        # print(f"   ⏩ 已存在 (跳过): {filename}")
        return public_path

    # 5. 下载
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        r = requests.get(full_url, headers=headers, timeout=10)
        if r.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(r.content)
            print(f"   ✅ 下载成功: {filename}")
            return public_path
        else:
            print(f"   ❌ 下载失败 ({r.status_code}): {full_url}")
            return None
    except Exception as e:
        print(f"   ❌ 下载错误: {e}")
        return None

def main():
    if not os.path.exists(ARCTYPE_CSV):
        print(f"找不到 {ARCTYPE_CSV}，请确认文件位置。")
        return

    if not os.path.exists(IMAGE_SAVE_DIR):
        os.makedirs(IMAGE_SAVE_DIR)

    print("🚀 开始处理 dede_arctype.csv ...")
    
    try:
        df = pd.read_csv(ARCTYPE_CSV, encoding='utf-8')
    except:
        df = pd.read_csv(ARCTYPE_CSV, encoding='gb18030') # 尝试GBK编码

    categories = []

    for index, row in df.iterrows():
        # === 强制类型转换，防止 AttributeError ===
        cat_id = str(row.get('id', '')).strip()
        typename = str(row.get('typename', '')).strip()
        parent_id = str(row.get('reid', '0')).strip()
        if parent_id == 'nan': parent_id = '0'
        
        # 处理 Slug (这里就是你报错的地方)
        raw_typedir = row.get('typedir', '')
        if pd.isna(raw_typedir):
            slug = ""
        else:
            # 强制转字符串再 replace
            slug = str(raw_typedir).replace('{cmspath}/', '').strip()

        # 处理图片
        raw_img = row.get('litpic', '') # 也就是缩略图
        
        print(f"正在处理 ID: {cat_id} - {typename}")

        local_img_url = download_image(raw_img, IMAGE_SAVE_DIR)

        cat_obj = {
            "id": cat_id,
            "name": typename,
            "parentId": parent_id,
            "slug": slug,
            "description": str(row.get('description', '')).replace('nan', ''),
            "image": local_img_url
        }
        categories.append(cat_obj)

    # 保存结果
    # 确保 data 目录存在
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 处理完成！数据已保存到 {OUTPUT_JSON}")

if __name__ == "__main__":
    main()