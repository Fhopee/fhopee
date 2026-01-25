import json
import os
import glob
import shutil

# ================= 🔧 配置区域 (必须与 09 脚本保持一致) =================

CUSTOM_MATCH_RULES = {
    "95-degree-pallet-exchanger": "95-degree-", 
    "industrial-automatic-cable-coiling-rewinding-machine": "automatic-cable-coiling-rewinding-machine",
    "fhope-shirnk-wrapper": "shrink-wrapper-machine",
}

SHARED_GALLERY_RULES = {
    "Pallet Changer": [],
    "Automatic horizontal stretch wrapper": []
}

# ================= 🚀 撤销逻辑 =================

PRODUCTS_JSON = 'data/products_ready.json'
IMAGES_DIR = 'public/images/products'
IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP']

def undo_gallery_update():
    print("🚀 开始撤销产品相册的自动更新...")
    
    # 1. 创建备份
    backup_path = PRODUCTS_JSON + ".undo_bak"
    try:
        shutil.copy2(PRODUCTS_JSON, backup_path)
        print(f"✅ 已创建备份: {backup_path}")
    except Exception as e:
        print(f"❌ 备份失败: {e}")
        return
    
    try:
        with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
            products = json.load(f)
    except FileNotFoundError:
        print(f"❌ 错误：找不到文件 {PRODUCTS_JSON}")
        return

    updated_count = 0
    removed_images_count = 0

    for product in products:
        slug = product.get('slug')
        category = product.get('categoryName')
        
        # 获取当前相册
        if 'gallery' not in product or not isinstance(product['gallery'], list):
            continue
            
        original_gallery = product['gallery']
        if not original_gallery:
            continue
            
        # 找出应该被移除的图片（即 09 脚本会自动添加的图片）
        images_to_remove = set()

        # --- 策略 A: 确定匹配前缀 ---
        match_prefixes = [slug]
        if slug in CUSTOM_MATCH_RULES:
            rule = CUSTOM_MATCH_RULES[slug]
            if isinstance(rule, list):
                match_prefixes = rule
            else:
                match_prefixes = [rule]

        # --- 策略 B: 扫描图片 (找出符合自动规则的图片) ---
        for prefix in match_prefixes:
            if not prefix: continue
            
            for ext in IMAGE_EXTENSIONS:
                pattern1 = os.path.join(IMAGES_DIR, f"{prefix}-*{ext}")
                pattern2 = os.path.join(IMAGES_DIR, f"{prefix}{ext}")
                
                found_files = glob.glob(pattern1) + glob.glob(pattern2)
                
                for file_path in found_files:
                    rel_path = os.path.relpath(file_path, 'public')
                    web_path = '/' + rel_path.replace('\\', '/')
                    images_to_remove.add(web_path)

        # --- 策略 C: 公共图库 ---
        if category and category in SHARED_GALLERY_RULES:
            shared_images = SHARED_GALLERY_RULES[category]
            for img in shared_images:
                images_to_remove.add(img)

        # 执行移除
        new_gallery = [img for img in original_gallery if img not in images_to_remove]
        
        # 只有当相册内容发生变化时才更新
        if len(new_gallery) != len(original_gallery):
            updated_count += 1
            removed_count = len(original_gallery) - len(new_gallery)
            removed_images_count += removed_count
            product['gallery'] = new_gallery
            # print(f"✅ [{slug}] 移除了 {removed_count} 张自动关联的图片")

    # 保存
    if updated_count > 0:
        with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"\n🎉 撤销完成！已还原 {updated_count} 个产品的相册。")
        print(f"🗑️ 共移除了 {removed_images_count} 张自动关联的图片。")
    else:
        print("\n✨ 没有发现需要撤销的改动。")

if __name__ == "__main__":
    undo_gallery_update()



