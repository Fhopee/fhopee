import json
import os

# ================= 🔧 配置区域 =================
# 你的高质量产品数据
INPUT_PRODUCT_FILE = "products_merged.json"
# 你的分类字典 (由 05 脚本生成)
CATEGORY_FILE = "data/categories_enriched.json"
# 输出给网站用的最终文件
OUTPUT_FILE = "data/products_ready.json"
# ==============================================

def clean_type_id(raw_id):
    """清洗 ID: 解决 121.0 != 121 的问题"""
    if not raw_id: return None
    s_id = str(raw_id).strip()
    if s_id.lower() == 'nan' or s_id == '': return None
    try:
        # 先转 float 再转 int 再转 str (处理 "121.0")
        return str(int(float(s_id)))
    except:
        return s_id

def main():
    print("🚀 开始快速关联分类名称 (不修改内容)...")

    # 1. 加载分类字典
    if not os.path.exists(CATEGORY_FILE):
        print(f"❌ 错误: 找不到 {CATEGORY_FILE}，请先运行 05_fetch_category_images.py")
        return

    try:
        with open(CATEGORY_FILE, 'r', encoding='utf-8') as f:
            cat_list = json.load(f)
            # 建立 ID -> Name 映射表
            category_map = {str(item['id']).strip(): item['name'] for item in cat_list}
        print(f"📚 字典加载成功: {len(category_map)} 个分类")
    except Exception as e:
        print(f"❌ 读取字典失败: {e}")
        return

    # 2. 加载产品数据
    if not os.path.exists(INPUT_PRODUCT_FILE):
        print(f"❌ 错误: 找不到 {INPUT_PRODUCT_FILE}")
        return

    with open(INPUT_PRODUCT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"📦 读取到 {len(products)} 个产品，开始匹配...")

    # 3. 遍历并注入 categoryName
    matched_count = 0
    default_count = 0

    for p in products:
        raw_tid = p.get('typeid')
        clean_tid = clean_type_id(raw_tid)
        
        # 核心逻辑：只更新 categoryName，绝对不碰 fullContentHtml
        if clean_tid in category_map:
            p['categoryName'] = category_map[clean_tid]
            matched_count += 1
        else:
            # 如果找不到 ID，或者 ID 为空，给个默认分类，防止网站报错
            p['categoryName'] = "Packaging Machinery"
            default_count += 1
            # print(f"⚠️ 未匹配 ID: {raw_tid}")

    # 4. 保存结果
    # 确保目标目录存在
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print("-" * 30)
    print(f"🎉 处理完成！")
    print(f"✅ 成功匹配分类: {matched_count}")
    print(f"⚠️ 使用默认分类: {default_count}")
    print(f"💾 最终文件已生成: {OUTPUT_FILE}")
    print("-" * 30)
    print("👉 现在去刷新你的 Next.js 网页，分类应该全出来了！")

if __name__ == "__main__":
    main()