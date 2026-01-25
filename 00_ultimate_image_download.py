import pandas as pd
import requests
import os
import urllib.parse
from urllib.parse import urljoin, urlsplit, urlunsplit
from tqdm import tqdm

# ================= 🔧 配置区域 =================
ARCHIVES_CSV = "dede_archives.csv" 
BASE_DOMAIN = "https://www.fhopepack.com" # 你的旧域名
SAVE_DIR = "public/images/products"
LOG_FILE = "final_failed_images.txt"
# ===========================================

def get_smart_url(base_domain, raw_path):
    """
    智能解析 URL，处理绝对路径、相对路径和中文编码
    """
    path = str(raw_path).strip()
    if not path or path.lower() == 'nan':
        return None

    target_url = ""

    # === 情况 A: 已经是绝对路径 (http/https 开头) ===
    if path.lower().startswith('http'):
        # 即使是完整 URL，路径里的中文也需要编码，但不能编码 :// 部分
        parts = urlsplit(path)
        # 对 path 部分进行编码 (safe='/') 
        # 比如 /uploads/缠绕机.jpg -> /uploads/%E7%BC...jpg
        encoded_path = urllib.parse.quote(parts.path, safe='/')
        # 重新组合
        target_url = urlunsplit((parts.scheme, parts.netloc, encoded_path, parts.query, parts.fragment))
    
    # === 情况 B: 相对路径 ===
    else:
        # 补全前导斜杠
        if not path.startswith('/'):
            path = '/' + path
        
        # 编码路径
        encoded_path = urllib.parse.quote(path, safe='/')
        # 拼接
        target_url = urljoin(base_domain, encoded_path)

    return target_url

def download_file(url, save_path):
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
    except:
        return False

def main():
    print("🚀 启动终极图片下载器 (处理绝对/相对路径 + 中文)...")
    
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    # 读取 CSV
    try:
        df = pd.read_csv(ARCHIVES_CSV, encoding='utf-8')
    except:
        df = pd.read_csv(ARCHIVES_CSV, encoding='gb18030')

    # 提取所有图片任务
    tasks = []
    for _, row in df.iterrows():
        img_path = str(row.get('litpic', ''))
        if img_path and img_path.lower() != 'nan' and img_path != '':
            tasks.append(img_path)

    print(f"📊 扫描到 {len(tasks)} 条图片记录")

    success_count = 0
    skip_count = 0
    failed_list = []

    for raw_path in tqdm(tasks, desc="Downloading"):
        # 1. 计算本地文件名
        # 无论 raw_path 是 "http://..." 还是 "/uploads/..."，我们只取最后的文件名
        # 使用 split('?')[0] 去掉可能存在的 URL 参数
        filename = os.path.basename(raw_path).split('?')[0]
        
        # ⚠️ 如果文件名太长或含有非法字符，可能需要处理，这里假设 DedeCMS 文件名相对规范
        local_path = os.path.join(SAVE_DIR, filename)

        # 2. 检查是否跳过
        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            skip_count += 1
            continue

        # 3. 解析下载链接
        download_url = get_smart_url(BASE_DOMAIN, raw_path)
        
        if not download_url:
            continue

        # 4. 执行下载
        if download_file(download_url, local_path):
            success_count += 1
        else:
            # 失败记录
            failed_list.append(f"{raw_path}  ->  {download_url}")

    # 写入失败日志
    if failed_list:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            f.write("\n".join(failed_list))

    print("-" * 30)
    print(f"🎉 任务结束！")
    print(f"⏩ 已存在(跳过): {skip_count}")
    print(f"✅ 成功下载: {success_count}")
    print(f"❌ 依然失败: {len(failed_list)}")
    if len(failed_list) > 0:
        print(f"⚠️ 失败详情请查看: {LOG_FILE}")
        print("💡 提示：如果依然失败，通常是因为源站已经删除了该文件，或者文件名包含了无法处理的字符。")

if __name__ == "__main__":
    main()