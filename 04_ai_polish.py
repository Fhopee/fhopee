import json
import os
from openai import OpenAI
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# ================= 🔧 配置区域 =================
DEEPSEEK_API_KEY = "sk-1fa5577857ea4162aa2c9a166328064c"  # 🔴 别忘了填你的 Key
INPUT_FILE = "products_merged.json"          # 包含 typeid 的源数据
OUTPUT_FILE = "products_ready.json"          # 输出给网站用的数据
CATEGORY_FILE = "data/categories_enriched.json" # 刚才生成的分类字典
MAX_WORKERS = 5
# ==============================================

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# 1. 加载分类字典 (从 enriched json 加载，更准确)
try:
    with open(CATEGORY_FILE, 'r', encoding='utf-8') as f:
        cat_list = json.load(f)
        # 建立 ID -> Name 的映射表
        # 注意：这里把 ID 强转为字符串，确保匹配
        CATEGORY_MAP = {str(item['id']).strip(): item['name'] for item in cat_list}
    print(f"📚 分类字典加载成功: {len(CATEGORY_MAP)} 个分类")
except Exception as e:
    CATEGORY_MAP = {}
    print(f"⚠️ 警告: 无法读取 {CATEGORY_FILE} ({e})")
    print("   请确保你已经运行了 05_fetch_category_images.py")

def clean_type_id(raw_id):
    """清洗 ID"""
    if not raw_id: return None
    s_id = str(raw_id).strip()
    if s_id.lower() == 'nan' or s_id == '': return None
    try:
        return str(int(float(s_id)))
    except:
        return s_id

def polish_product(entry):
    raw_type_id = entry.get('typeid')
    clean_id = clean_type_id(raw_type_id)
    
    # 核心：查字典
    cat_name = CATEGORY_MAP.get(clean_id)
    
    # 如果找不到，标记一下，但不要报错
    if not cat_name:
        # 默认兜底，或者保留原标题里的线索
        cat_name = "Packaging Machinery" 
    
    # 构造 Prompt (简化版，只为了生成 JSON)
    prompt = f"""
    ### TASK
    Convert raw product data to clean JSON for a B2B website.
    
    ### INPUT
    Title: {entry.get('source_title', '')}
    Category Context: {cat_name}
    Raw Body: {entry.get('raw_body', '')[:1000]}
    
    ### REQUIREMENTS
    1. Output strictly valid JSON.
    2. 'categoryName' MUST be exactly: "{cat_name}" (Do not change this!).
    3. Generate a professional 'fullContentHtml'.
    4. Extract technical specs into 'specifications'.
    
    ### OUTPUT STRUCTURE
    {{
        "id": "{entry.get('id')}",
        "categoryName": "{cat_name}",
        "productName": "...",
        "slug": "{entry.get('slug')}",
        "seoTitle": "...",
        "metaDescription": "...",
        "fullContentHtml": "...",
        "specifications": {{ "Speed": "...", "Power": "..." }},
        "mainImage": "{entry.get('mainImage')}",
        "gallery": {json.dumps(entry.get('gallery', []))}
    }}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a JSON generator. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        content = response.choices[0].message.content.strip()
        # 清洗 Markdown 标记
        if content.startswith('```json'): content = content[7:]
        if content.endswith('```'): content = content[:-3]
        return json.loads(content)
    except Exception as e:
        # print(f"Error: {e}")
        return None

def main():
    print(f"🚀 开始最终润色...")
    
    if not os.path.exists(INPUT_FILE):
        print(f"❌ 找不到 {INPUT_FILE}")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    results = []
    # 为了测试，你可以先把 [:10] 加上，只跑前10个看看效果
    # data = data[:10] 
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(polish_product, item): item for item in data}
        
        for future in tqdm(as_completed(futures), total=len(data)):
            res = future.result()
            if res:
                results.append(res)
                # 每20个存一次，防止中断
                if len(results) % 20 == 0:
                     with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                        json.dump(results, f, indent=2, ensure_ascii=False)

    # 最终保存
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 大功告成！")
    print(f"1. 请检查 {OUTPUT_FILE}。")
    print(f"2. 务必将它移动到 data/ 文件夹覆盖旧文件：")
    print(f"   move {OUTPUT_FILE} -> data/{OUTPUT_FILE}")

if __name__ == "__main__":
    main()