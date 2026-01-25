import pandas as pd
import json
import re

def is_english_content(text):
    if pd.isna(text) or not str(text).strip():
        return True
    text = str(text)
    if re.search(r'[\u4e00-\u9fff]', text):
        return False
    if re.search(r'[А-Яа-яЁё]', text):
        return False
    spanish_words = ['máquina', 'para', 'con', 'del', 'las', 'los', 'una', 'este', 'esta', 'serie']
    text_lower = text.lower()
    spanish_count = sum(1 for word in spanish_words if word in text_lower)
    if spanish_count >= 3:
        return False
    return True

# 读取CSV文件
try:
    archives = pd.read_csv('dede_archives.csv', encoding='utf-8')
    addon = pd.read_csv('dede_addonshop.csv', encoding='utf-8')
except:
    archives = pd.read_csv('dede_archives.csv', encoding='gbk')
    addon = pd.read_csv('dede_addonshop.csv', encoding='gbk')

merged = pd.merge(archives, addon, left_on='id', right_on='aid', how='left')

# 检查ID 1-90是否存在
print("=" * 80)
print("检查CSV中是否存在ID 1-90的产品")
print("=" * 80)

missing_ids = []
existing_ids = []

for id_num in range(1, 91):
    id_str = str(id_num)
    matching_rows = merged[merged['id'].astype(str) == id_str]
    
    if len(matching_rows) == 0:
        missing_ids.append(id_num)
    else:
        row = matching_rows.iloc[0]
        title = str(row.get('title', ''))
        description = str(row.get('description', ''))
        title_ok = is_english_content(title)
        desc_ok = is_english_content(description)
        is_filtered = not (title_ok and desc_ok)
        
        existing_ids.append({
            'id': id_num,
            'title': title[:60],
            'filtered': is_filtered,
            'reason': '中文' if not title_ok and re.search(r'[\u4e00-\u9fff]', title) else 
                     '西班牙语' if not desc_ok else '英文'
        })

print(f"\n缺失的ID (1-90中不存在): {len(missing_ids)} 个")
if missing_ids:
    print(f"缺失ID列表: {missing_ids[:20]}...")  # 只显示前20个

print(f"\n存在的ID (1-90中): {len(existing_ids)} 个")
print("\n存在的产品详情:")
for item in existing_ids[:20]:  # 只显示前20个
    status = "[被过滤]" if item['filtered'] else "[通过]"
    print(f"  ID {item['id']:3d} {status} - {item['title']}... ({item['reason']})")

# 检查products_final.json中的ID
print("\n" + "=" * 80)
print("检查products_final.json中的ID分布")
print("=" * 80)

try:
    with open('products_final.json', 'r', encoding='utf-8') as f:
        final_data = json.load(f)
    
    final_ids = [int(item['id']) for item in final_data if 'id' in item]
    final_ids_sorted = sorted(final_ids)
    
    print(f"products_final.json中共有 {len(final_ids)} 个产品")
    print(f"最小ID: {min(final_ids_sorted) if final_ids_sorted else 'N/A'}")
    print(f"最大ID: {max(final_ids_sorted) if final_ids_sorted else 'N/A'}")
    
    # 检查1-90中有哪些在final中
    ids_1_90_in_final = [id_num for id_num in range(1, 91) if id_num in final_ids]
    ids_1_90_not_in_final = [id_num for id_num in range(1, 91) if id_num not in final_ids]
    
    print(f"\nID 1-90中在products_final.json中的: {len(ids_1_90_in_final)} 个")
    print(f"ID 1-90中不在products_final.json中的: {len(ids_1_90_not_in_final)} 个")
    
    if ids_1_90_not_in_final:
        print(f"\n缺失的ID列表: {ids_1_90_not_in_final[:30]}...")
        
except FileNotFoundError:
    print("products_final.json 文件不存在")

print("=" * 80)

