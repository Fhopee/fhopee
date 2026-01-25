import pandas as pd
import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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

# 只取前851行
merged = merged.iloc[0:851]

print("=" * 80)
print("检查索引0-89对应的产品ID和过滤情况")
print("=" * 80)

# 检查索引0-89
filtered_by_lang = []
passed = []

for idx in range(min(90, len(merged))):
    row = merged.iloc[idx]
    product_id = str(row.get('id', 'N/A'))
    title = str(row.get('title', ''))
    description = str(row.get('description', ''))
    
    title_ok = is_english_content(title)
    desc_ok = is_english_content(description)
    is_filtered = not (title_ok and desc_ok)
    
    if is_filtered:
        reason = []
        if not title_ok:
            if re.search(r'[\u4e00-\u9fff]', title):
                reason.append("标题含中文")
            elif re.search(r'[А-Яа-яЁё]', title):
                reason.append("标题含俄语")
            else:
                reason.append("标题可能是西班牙语")
        if not desc_ok:
            if re.search(r'[\u4e00-\u9fff]', description):
                reason.append("描述含中文")
            elif re.search(r'[А-Яа-яЁё]', description):
                reason.append("描述含俄语")
            else:
                reason.append("描述可能是西班牙语")
        
        filtered_by_lang.append({
            'index': idx,
            'id': product_id,
            'title': title[:50],
            'reason': ', '.join(reason)
        })
    else:
        passed.append({
            'index': idx,
            'id': product_id,
            'title': title[:50]
        })

print(f"\n索引0-89中:")
print(f"  通过语言过滤: {len(passed)} 个")
print(f"  被语言过滤: {len(filtered_by_lang)} 个")

print(f"\n被语言过滤的产品:")
for item in filtered_by_lang:
    print(f"  索引{item['index']:3d} | ID: {item['id']:4s} | {item['title']}... | 原因: {item['reason']}")

# 检查products_final.json中是否有这些ID
print("\n" + "=" * 80)
print("检查这些ID是否在products_final.json中")
print("=" * 80)

try:
    with open('products_final.json', 'r', encoding='utf-8') as f:
        final_data = json.load(f)
    
    final_ids = {int(item['id']) for item in final_data if 'id' in item}
    
    print(f"\n索引0-89中通过语言过滤的产品ID:")
    passed_ids = [int(item['id']) for item in passed]
    in_final = [id_num for id_num in passed_ids if id_num in final_ids]
    not_in_final = [id_num for id_num in passed_ids if id_num not in final_ids]
    
    print(f"  在products_final.json中: {len(in_final)} 个")
    print(f"  不在products_final.json中: {len(not_in_final)} 个")
    
    if not_in_final:
        print(f"\n  不在final中的ID: {not_in_final[:20]}...")
        print(f"  可能原因: AI处理失败、图片下载失败、或其他错误")
        
except FileNotFoundError:
    print("products_final.json 文件不存在")

print("=" * 80)

