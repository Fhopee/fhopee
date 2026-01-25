import pandas as pd
import requests
import os
import time
from urllib.parse import urljoin
from tqdm import tqdm

# ================= 🔧 配置区域 =================
ADDON_CSV = "dede_addonshop.csv" 
BASE_URL = "https://www.fhopepack.com"
SAVE_DIR = "public/images/products"
# ===========================================

def download_image(url, save_path):
    """下载图片，带重试机制"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(r.content)
            return True
        return False
    except Exception as e:
        return False

def main():
    print("Start downloading litpic1-4 images from dede_addonshop.csv...")
    
    # 1. 准备目录
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    # 2. 读取 CSV
    if not os.path.exists(ADDON_CSV):
        print(f"❌ 错误: 找不到文件 {ADDON_CSV}")
        return

    try:
        df = pd.read_csv(ADDON_CSV, encoding='utf-8')
    except:
        print("⚠️ UTF-8 读取失败, 尝试 GB18030...")
        df = pd.read_csv(ADDON_CSV, encoding='gb18030')

    # 3. 提取并去重图片路径
    print("Extracting image links...")
    image_paths = set()
    
    target_cols = ['litpic1', 'litpic2', 'litpic3', 'litpic4']
    
    # 检查列是否存在
    valid_cols = [col for col in target_cols if col in df.columns]
    
    if not valid_cols:
        print(f"Error: litpic1-4 columns not found in CSV")
        return

    for col in valid_cols:
        # 获取该列所有非空值
        paths = df[col].dropna().astype(str).tolist()
        for p in paths:
            p = p.strip()
            if p and p.lower() != 'nan' and p != '':
                image_paths.add(p)

    print(f"Found {len(image_paths)} unique image links")

    downloaded_count = 0
    skipped_count = 0
    failed_count = 0

    # 4. 遍历下载
    for rel_path in tqdm(list(image_paths), desc="Processing images"):
        # 清洗路径
        clean_path = rel_path
        if not clean_path.startswith('/'): 
            clean_path = '/' + clean_path
        
        # 提取文件名
        filename = os.path.basename(clean_path)
        # 去掉 URL 参数 (?ver=1.0)
        filename = filename.split('?')[0] 
        
        # ⚠️ 简单的文件名合法性检查
        if not filename or len(filename) > 200:
            continue

        local_path = os.path.join(SAVE_DIR, filename)
        
        # === 核心逻辑：检查是否存在 ===
        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            skipped_count += 1
            continue  # 跳过，不需要下载
        
        # === 如果不存在，或者文件大小为0，则下载 ===
        full_url = urljoin(BASE_URL, clean_path)
        success = download_image(full_url, local_path)
        
        if success:
            downloaded_count += 1
            time.sleep(0.05) # 稍微休息下防止封IP
        else:
            failed_count += 1
            # print(f"❌ 下载失败: {full_url}")

    print("-" * 30)
    print(f"Task finished!")
    print(f"Skipped (already exists): {skipped_count}")
    print(f"Successfully downloaded: {downloaded_count}")
    print(f"Failed to download: {failed_count}")

if __name__ == "__main__":
    main()

