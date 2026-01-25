import pandas as pd
import re
import sys
import io

# 设置输出编码为UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def is_english_content(text):
    """
    判断内容是否为英文（排除中文、西班牙语、俄语）
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
    
    # 检查西班牙语特殊字符组合
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

# 检查前90行（索引0-89）
print("=" * 80)
print("检查前90行（索引0-89）的产品过滤情况")
print("=" * 80)
print(f"总共有 {len(merged)} 行数据\n")

filtered_count = 0
english_count = 0

for idx in range(min(90, len(merged))):
    row = merged.iloc[idx]
    product_id = row.get('id', 'N/A')
    title = str(row.get('title', ''))
    description = str(row.get('description', ''))
    
    title_is_english = is_english_content(title)
    desc_is_english = is_english_content(description)
    
    is_filtered = not (title_is_english and desc_is_english)
    
    if is_filtered:
        filtered_count += 1
        print(f"\n[索引 {idx}] ID: {product_id} - 被过滤")
        print(f"  Title: {title[:80]}...")
        print(f"  Title是英文: {title_is_english}")
        if not title_is_english:
            # 检查原因
            if re.search(r'[\u4e00-\u9fff]', title):
                print(f"    [X] 原因: 包含中文字符")
            elif re.search(r'[А-Яа-яЁё]', title):
                print(f"    [X] 原因: 包含俄语字符")
            else:
                print(f"    [X] 原因: 可能是西班牙语")
        print(f"  Description: {description[:80] if description else '(空)'}...")
        print(f"  Description是英文: {desc_is_english}")
        if not desc_is_english:
            if re.search(r'[\u4e00-\u9fff]', description):
                print(f"    [X] 原因: 包含中文字符")
            elif re.search(r'[А-Яа-яЁё]', description):
                print(f"    [X] 原因: 包含俄语字符")
            else:
                print(f"    [X] 原因: 可能是西班牙语")
    else:
        english_count += 1

print("\n" + "=" * 80)
print(f"统计结果:")
print(f"  总检查行数: {min(90, len(merged))}")
print(f"  英文产品（通过）: {english_count}")
print(f"  被过滤产品: {filtered_count}")
print("=" * 80)

