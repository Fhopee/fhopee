import json
import os

# ================= 配置 =================
INPUT_FILE = "products_final.json"       # DeepSeek 第一步生成的文件
OUTPUT_FILE = "products_unique.json"     # 去重后的结果
# =======================================

def get_english_score(text):
    """计算文本的英语纯度 (0.0 - 1.0)"""
    if not text: return 0.0
    clean_text = ''.join(text.split())
    if len(clean_text) == 0: return 0.0
    
    # 统计 ASCII 字符 (A-Z, a-z, 0-9)
    ascii_count = sum(1 for char in clean_text if ord(char) < 128)
    return ascii_count / len(clean_text)

def main():
    print("🧹 开始执行：严格英语优先去重...")
    
    if not os.path.exists(INPUT_FILE):
        print(f"❌ 找不到文件: {INPUT_FILE}")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"📊 原始混合数据: {len(products)} 条")

    # 1. 认亲：按图片归类 (同一产品的图片路径通常相同)
    groups = {}
    for p in products:
        # 提取文件名作为唯一Key (如 /imgs/abc.jpg -> abc.jpg)
        img_path = p.get('mainImage', '')
        if not img_path or 'placeholder' in img_path:
            # 如果没图，用标题前10个字符做临时Key
            key = p.get('source_title', str(p['id']))[:10]
        else:
            key = os.path.basename(img_path)
            
        if key not in groups:
            groups[key] = []
        groups[key].append(p)

    print(f"🧩 识别出 {len(groups)} 个独立产品型号。")

    # 2. 选优：只留英语版
    unique_products = []
    
    for key, candidates in groups.items():
        if len(candidates) == 1:
            # 只有一个版本，直接留着
            unique_products.append(candidates[0])
        else:
            # 有多个版本 (如 英/中/西)
            # 排序规则：
            # 1. 英语纯度高者优先 (score 大的排前面)
            # 2. 如果纯度一样，内容长度长者优先 (信息量大)
            candidates.sort(
                key=lambda x: (
                    get_english_score(x.get('source_title', '') + str(x.get('fullContentHtml', ''))),
                    len(str(x.get('fullContentHtml', '')))
                ),
                reverse=True
            )
            
            # 选第一名 (也就是最像英语、最完整的那个)
            best_one = candidates[0]
            unique_products.append(best_one)

    # 3. 保存
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique_products, f, indent=2, ensure_ascii=False)
        
    print("-" * 30)
    print(f"✅ 清洗完成！")
    print(f"   从 {len(products)} 条数据 -> 瘦身到 {len(unique_products)} 条")
    print(f"   删除了 {len(products) - len(unique_products)} 个多语言副本")
    print(f"💾 干净数据已保存至: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()