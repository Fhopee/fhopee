import pandas as pd
import requests
import os
import time
from urllib.parse import urljoin
from tqdm import tqdm

# ================= 配置区域 =================
# 你的 DedeCMS 主表 (包含图片路径)
ARCHIVES_CSV = "dede_archives.csv" 
# 旧网站域名
BASE_URL = "https://www.fhopepack.com"
# 图片保存位置
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
        # print(f"Error: {e}")
        return False

def main():
    print("🚀 开始图片增量同步 (只下载缺失的)...")
    
    # 1. 准备目录
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    # 2. 读取 CSV
    try:
        df = pd.read_csv(ARCHIVES_CSV, encoding='utf-8')
    except:
        df = pd.read_csv(ARCHIVES_CSV, encoding='gb18030')

    # 3. 筛选有图片的记录
    # 假设图片列叫 'litpic'
    tasks = []
    for _, row in df.iterrows():
        img_path = str(row.get('litpic', ''))
        if img_path and img_path.lower() != 'nan' and img_path != '':
            tasks.append(img_path)

    print(f"📊 总共发现 {len(tasks)} 条图片记录")

    downloaded_count = 0
    skipped_count = 0
    failed_count = 0

    # 4. 遍历并检查
    for rel_path in tqdm(tasks, desc="Checking images"):
        # 清洗路径
        if not rel_path.startswith('/'): rel_path = '/' + rel_path
        
        filename = os.path.basename(rel_path)
        # 去掉 URL 参数 (?ver=1.0)
        filename = filename.split('?')[0] 
        
        local_path = os.path.join(SAVE_DIR, filename)
        
        # === 核心逻辑：检查是否存在 ===
        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            skipped_count += 1
            continue  # 跳过，不需要下载
        
        # === 如果不存在，或者文件大小为0，则下载 ===
        full_url = urljoin(BASE_URL, rel_path)
        success = download_image(full_url, local_path)
        
        if success:
            downloaded_count += 1
            time.sleep(0.1) #稍微休息下防止封IP
        else:
            failed_count += 1

    print("-" * 30)
    print(f"🎉 同步完成！")
    print(f"⏩ 已存在(跳过): {skipped_count}")
    print(f"✅ 新增下载: {downloaded_count}")
    print(f"❌ 下载失败: {failed_count}")

if __name__ == "__main__":
    main()