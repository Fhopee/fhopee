import pandas as pd
import json
import os
import numpy as np

# ================= 🔧 配置区域 =================
ARCHIVES_CSV = "dede_archives.csv"     # 主表 (ID, Title, TypeID, Litpic)
ADDON_CSV = "dede_addonshop.csv"       # 详情表 (Body, Specs)
ARCTYPE_CSV = "dede_arctype.csv"       # 栏目表 (ID, TypeName, ReID)
OUTPUT_FILE = "products_raw_structured.json"
BASE_IMG_URL = "/images/products/"     # 前端引用的路径前缀
# ===========================================

def clean_id(val):
    """清洗ID：转字符串，去小数点"""
    if pd.isna(val): return None
    return str(val).replace('.0', '').strip()

def main():
    print("🚀 开始严格数据清洗 (ETL v2 - 图片同步版)...")

    # 1. 读取 CSV (尝试不同编码)
    def read_csv_safe(path):
        try:
            return pd.read_csv(path, encoding='utf-8')
        except:
            return pd.read_csv(path, encoding='gb18030')

    if not os.path.exists(ARCHIVES_CSV):
        print(f"❌ 找不到 {ARCHIVES_CSV}")
        return

    df_arc = read_csv_safe(ARCHIVES_CSV)
    df_addon = read_csv_safe(ADDON_CSV)
    df_type = read_csv_safe(ARCTYPE_CSV)

    print(f"📊 读取数据: 主表 {len(df_arc)}条, 详情表 {len(df_addon)}条, 栏目表 {len(df_type)}条")

    # 2. 预处理 ID 列
    df_arc['id'] = df_arc['id'].apply(clean_id)
    df_arc['typeid'] = df_arc['typeid'].apply(clean_id)
    
    # 详情表关联ID通常叫 aid
    df_addon['aid'] = df_addon['aid'].apply(clean_id) 
    
    df_type['id'] = df_type['id'].apply(clean_id)
    df_type['reid'] = df_type['reid'].apply(clean_id)

    # 3. 构建分类树 (L1/L2 映射)
    type_map = {}
    for _, row in df_type.iterrows():
        if row['id']:
            type_map[row['id']] = {
                "name": str(row['typename']).strip(),
                "pid": str(row['reid']).strip() if row['reid'] and row['reid'] != '0' else None
            }

    def get_category_path(type_id):
        if type_id not in type_map:
            return "Uncategorized", "Uncategorized", "Uncategorized"
        
        current = type_map[type_id]
        path = [current['name']]
        curr_id = type_id
        
        while current['pid'] and current['pid'] in type_map:
            parent = type_map[current['pid']]
            path.insert(0, parent['name'])
            curr_id = current['pid']
            current = parent
            
        l1_name = path[0]
        l2_name = path[1] if len(path) > 1 else path[0]
        
        return l1_name, l2_name, type_map[type_id]['name']

    # 4. 合并 主表 + 详情表
    merged = pd.merge(df_arc, df_addon, left_on='id', right_on='aid', how='left')

    products = []
    
    for _, row in merged.iterrows():
        # 获取分类层级
        tid = row['typeid']
        l1, l2, current_cat = get_category_path(tid)