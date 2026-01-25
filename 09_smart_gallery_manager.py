import json
import os
import glob

# ================= 🔧 配置区域 (在这里解决您的匹配问题) =================

# 1. 【自定义匹配规则】
# 解决文件名和 Slug 不一致的问题。
# 格式: "产品Slug": "图片文件名前缀"
# 只要图片文件名以 "前缀" 开头，就会被归入该 "产品Slug" 的相册。
CUSTOM_MATCH_RULES = {
    # 示例 1: 您的 95度翻转机
    "95-degree-pallet-exchanger": "95-degree-", 
    
    # 示例 2: 假设 Slug 是 "industrial-automatic-cable...", 但图片是 "automatic-cable..."
    "industrial-automatic-cable-coiling-rewinding-machine": "automatic-cable-coiling-rewinding-machine",
    
    # 示例 3: 假设 Slug 是 "fhope-shirnk-wrapper", 但图片是 "shrink-wrapper-machine"
    "fhope-shirnk-wrapper": "shrink-wrapper-machine",
}

# 2. 【公共图库规则】
# 格式: "分类名称": ["图片路径1", "图片路径2"]
# 自动给该分类下的所有产品添加通用图片（如证书、包装示意图）。
SHARED_GALLERY_RULES = {
    "Pallet Changer": [
        # "/images/products/shared/pallet-changer-working-flow.webp"
    ],
    "Automatic horizontal stretch wrapper": [
        # "/images/products/shared/ce-certificate.jpg"
    ]
}

# ================= 🚀 脚本逻辑 (无需修改) =================

PRODUCTS_JSON = 'data/products_ready.json'
IMAGES_DIR = 'public/images/products'
# 支持更多后缀，包括大写
IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP']

def update_gallery():
    print("🚀 开始智能更新产品相册...")
    
    try:
        with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
            products = json.load(f)
    except FileNotFoundError:
        print(f"❌ 错误：找不到文件 {PRODUCTS_JSON}")
        return

    updated_count = 0
    total_images_linked = 0

    for product in products:
        slug = product.get('slug')
        category = product.get('categoryName')
        main_image = product.get('mainImage', '')
        
        # 初始化 gallery
        if 'gallery' not in product or not isinstance(product['gallery'], list):
            product['gallery'] = []
            
        original_gallery_len = len(product['gallery'])
        # 使用 set 去重，并预先加入现有的 gallery
        current_gallery_set = set(product['gallery'])

        # --- 策略 A: 确定匹配前缀 ---
        # 默认使用 slug 作为前缀
        match_prefixes = [slug]
        
        # 如果在自定义规则中有定义，则使用自定义前缀（可以定义多个，用列表或单个字符串）
        if slug in CUSTOM_MATCH_RULES:
            rule = CUSTOM_MATCH_RULES[slug]
            if isinstance(rule, list):
                match_prefixes = rule
            else:
                match_prefixes = [rule]
            # print(f"🔍 产品 [{slug}] 使用自定义规则: {match_prefixes}")

        # --- 策略 B: 扫描图片 ---
        for prefix in match_prefixes:
            if not prefix: continue
            
            for ext in IMAGE_EXTENSIONS:
                # 模式 1: 前缀 + 连字符 + 任意字符 (e.g. slug-1.jpg, slug-detail.jpg)
                pattern1 = os.path.join(IMAGES_DIR, f"{prefix}-*{ext}")
                # 模式 2: 前缀 + 扩展名 (e.g. slug.jpg) - 主要是为了防止漏掉主图同名的其他变体
                pattern2 = os.path.join(IMAGES_DIR, f"{prefix}{ext}")
                
                found_files = glob.glob(pattern1) + glob.glob(pattern2)
                
                for file_path in found_files:
                    # 转换为 Web 路径
                    rel_path = os.path.relpath(file_path, 'public')
                    web_path = '/' + rel_path.replace('\\', '/')
                    
                    # 排除主图，避免重复显示
                    if web_path != main_image:
                        current_gallery_set.add(web_path)

        # --- 策略 C: 公共图库 ---
        if category and category in SHARED_GALLERY_RULES:
            shared_images = SHARED_GALLERY_RULES[category]
            for img in shared_images:
                if img != main_image:
                    current_gallery_set.add(img)

        # 更新数据
        new_gallery = sorted(list(current_gallery_set))
        product['gallery'] = new_gallery
        
        if len(new_gallery) != original_gallery_len:
            updated_count += 1
            diff = len(new_gallery) - original_gallery_len
            # print(f"✅ [{slug}] 新增 {diff} 张图片")
        
        total_images_linked += len(new_gallery)

    # 保存
    if updated_count > 0:
        with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"\n🎉 完成！共更新了 {updated_count} 个产品的相册。")
        print(f"📊 当前所有产品共关联了 {total_images_linked} 张相册图片。")
    else:
        print("\n✨ 相册已是最新，无需更新。")

if __name__ == "__main__":
    update_gallery()

