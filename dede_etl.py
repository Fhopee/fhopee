

import pandas as pd
import json
import os
import requests
import time
from openai import OpenAI
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm  # 进度条库
import threading
import re
import glob

# ================= 🔧 配置区域 =================
DEEPSEEK_API_KEY = "sk-9d2f0895548b49eaaf57543866af62e2" # 你的 Key
OLD_WEBSITE_DOMAIN = "http://www.fhopepack.com" # 你的旧域名 (不要带末尾斜杠)
TARGET_LANGUAGE = "English"
# ==============================================

# 并发数量 (建议设置 3-5。太高会导致 DeepSeek 报错 429 Too Many Requests)
MAX_WORKERS = 5 
# ==============================================

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# 创建一个锁，防止多个线程同时写入数据时出错
data_lock = threading.Lock()

def is_english_content(text):
    """
    判断内容是否为英文（排除中文、西班牙语、俄语）
    简单判断：如果包含中文字符、大量西班牙语/俄语特征字符，则返回False
    """
    if pd.isna(text) or not str(text).strip():
        return True  # 空内容默认为英文
    
    text = str(text)
    
    # 检查中文字符
    if re.search(r'[\u4e00-\u9fff]', text):
        return False
    
    # 检查俄语字符（西里尔字母）
    if re.search(r'[А-Яа-яЁё]', text):
        return False
    
    # 检查西班牙语特殊字符组合（如 ñ, á, é, í, ó, ú 等，但这些也可能在英文中出现）
    # 更准确的方法是检查常见的西班牙语词汇
    spanish_words = ['máquina', 'para', 'con', 'del', 'las', 'los', 'una', 'este', 'esta', 'serie']
    text_lower = text.lower()
    spanish_count = sum(1 for word in spanish_words if word in text_lower)
    # 如果包含多个西班牙语词汇，可能是西班牙语
    if spanish_count >= 3:
        return False
    
    return True

def find_existing_image_by_id(product_id, images_dir="public/images/products"):
    """
    根据产品ID查找已存在的图片文件
    返回找到的第一个图片路径，如果没有则返回None
    """
    if not os.path.exists(images_dir):
        return None
    
    # 尝试多种可能的文件名模式
    patterns = [
        f"*{product_id}*",
        f"*id-{product_id}*",
        f"*product-{product_id}*"
    ]
    
    for pattern in patterns:
        matches = glob.glob(os.path.join(images_dir, pattern))
        if matches:
            # 返回第一个匹配的文件，转换为web路径
            rel_path = os.path.relpath(matches[0], "public")
            return f"/{rel_path.replace(os.sep, '/')}"
    
    return None

def download_image(url, save_name_prefix, index=0, product_id=None):
    """
    下载图片，如果已存在则直接返回路径
    优先检查基于slug的文件，如果不存在，尝试根据product_id查找
    """
    if pd.isna(url) or not str(url).strip():
        # 如果没有URL，尝试根据product_id查找已存在的图片
        if product_id and index == 0:  # 只对主图尝试
            existing = find_existing_image_by_id(product_id)
            if existing:
                return existing
        return None
    
    url = str(url).strip()
    if not url.lower().startswith(('http://', 'https://')):
        clean_domain = OLD_WEBSITE_DOMAIN.rstrip('/')
        clean_path = url.lstrip('/')
        full_url = f"{clean_domain}/{clean_path}"
    else:
        full_url = url

    ext = os.path.splitext(url.split('?')[0])[1]
    if not ext: ext = ".jpg"
    
    if index == 0:
        filename = f"{save_name_prefix}{ext}"
    else:
        filename = f"{save_name_prefix}-{index}{ext}"
        
    save_path = f"public/images/products/{filename}"
    os.makedirs('public/images/products', exist_ok=True)

    if os.path.exists(save_path):
        return f"/images/products/{filename}"

    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(full_url, headers=headers, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return f"/images/products/{filename}"
    except Exception:
        # 如果下载失败，尝试根据product_id查找已存在的图片
        if product_id and index == 0:
            existing = find_existing_image_by_id(product_id)
            if existing:
                return existing
        return None
    return None

def extract_body_images(html_content, slug, product_id=None):
    """
    提取详情图，如果图片已存在则直接使用
    """
    if pd.isna(html_content): return []
    soup = BeautifulSoup(str(html_content), 'html.parser')
    images = []
    img_tags = soup.find_all('img')
    for i, img in enumerate(img_tags, 1):
        src = img.get('src')
        if src:
            local_path = download_image(src, slug, index=i, product_id=product_id)
            if local_path:
                images.append(local_path)
    return images

def clean_html_text(html_content):
    if pd.isna(html_content): return ""
    return BeautifulSoup(str(html_content), 'html.parser').get_text(separator='\n').strip()

def process_single_product(row):
    """
    处理单个产品的核心函数
    """
    try:
        # 0. 语言过滤：只处理英文内容
        title = str(row.get('title', ''))
        description = str(row.get('description', ''))
        body_text = clean_html_text(row.get('body', ''))
        
        # 检查title和description是否为英文
        if not is_english_content(title) or not is_english_content(description):
            return None  # 跳过非英文产品
        
        product_id = str(row.get('id', ''))
        
        # 1. AI 处理
        prompt = f"""
        Strictly Output JSON only. Rewrite for B2B SEO ({TARGET_LANGUAGE}).
        Title: {title}
        Body: {body_text[:1000]}
        
        Fields: productName, slug, seoTitle, metaDescription, features(array), specifications(object), fullContentHtml(tailwind css).
        """
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        content = response.choices[0].message.content.strip().replace('```json', '').replace('```', '')
        ai_data = json.loads(content)
        
        slug = ai_data['slug']
        
        # 2. 图片处理（传入product_id以便查找已存在的图片）
        main_image = download_image(row.get('litpic'), slug, index=0, product_id=product_id)
        gallery_images = extract_body_images(row.get('body'), slug, product_id=product_id)
        
        # 3. 返回结果
        return {
            "id": product_id,
            **ai_data,
            "mainImage": main_image if main_image else "/images/placeholder.jpg",
            "gallery": gallery_images
        }

    except Exception as e:
        # 出错时不中断，只打印错误
        # print(f"Error processing {row.get('title')}: {e}")
        return None

def main():
    print(f"🚀 启动极速模式 (线程数: {MAX_WORKERS})...")
    print(f"📋 处理范围: 索引 0 到 851 (共 852 条)")
    print(f"🌐 语言过滤: 仅处理英文产品")
    
    try:
        archives = pd.read_csv('dede_archives.csv', encoding='utf-8')
        addon = pd.read_csv('dede_addonshop.csv', encoding='utf-8')
    except:
        archives = pd.read_csv('dede_archives.csv', encoding='gbk')
        addon = pd.read_csv('dede_addonshop.csv', encoding='gbk')

    merged = pd.merge(archives, addon, left_on='id', right_on='aid', how='left')
    
    # 从索引0到851（共852条）
    merged = merged.iloc[0:851]
    
    # 预先过滤：只保留英文产品（提高效率）
    print("🔍 正在过滤英文产品...")
    english_mask = merged.apply(
        lambda row: is_english_content(row.get('title', '')) and 
                   is_english_content(row.get('description', '')),
        axis=1
    )
    merged = merged[english_mask]
    print(f"✅ 找到 {len(merged)} 个英文产品")
    
    # 转换为列表字典，方便分配任务
    all_tasks = merged.to_dict('records')
    
    final_results = []
    
    # 使用 ThreadPoolExecutor 并行处理
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # 提交所有任务
        futures = {executor.submit(process_single_product, task): task for task in all_tasks}
        
        # 使用 tqdm 显示进度条
        for future in tqdm(as_completed(futures), total=len(all_tasks), desc="Processing"):
            result = future.result()
            if result:
                final_results.append(result)

    # 保存
    print("💾 正在保存数据...")
    with open('products_final.json', 'w', encoding='utf-8') as f:
        json.dump(final_results, f, indent=2, ensure_ascii=False)
        
    print(f"\n✅ 全部完成！成功处理 {len(final_results)} 个产品。")

if __name__ == "__main__":
    main()