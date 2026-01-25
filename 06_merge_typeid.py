import json
import pandas as pd
import os

# ================= 🔧 配置区域 =================
# 你的现有产品数据
TARGET_JSON = "products_merged.json"
# DedeCMS 的档案主表 (包含 id 和 typeid 的对应关系)
SOURCE_CSV = "dede_archives.csv"
# 输出文件 (为了安全，建议另存一份，确认无误后再覆盖)
OUTPUT_JSON = "products_with_typeid.json"
# ==============================================

def main():
    print("🚀 开始合并 TypeID ...")

    # 1. 读取 CSV 建立映射字典
    if not os.path.exists(SOURCE_CSV):
        print(f"❌ 错误: 找不到 {SOURCE_CSV}")
        return

    try:
        # DedeCMS 导出通常是 GBK 或 GB18030
        df = pd.read_csv(SOURCE_CSV, encoding='gb18030') 
    except:
        df = pd.read_csv(SOURCE_CSV, encoding='utf-8')

    # 创建查找字典: { '产品ID': 'TypeID' }
    # 强制转为字符串，防止 int 和 string 不匹配
    id_map = dict(zip(df['id'].astype(str), df['typeid'].astype(str)))
    
    print(f"📚 映射表建立完成，共 {len(id_map)} 条记录。")

    # 2. 读取 JSON
    if not os.path.exists(TARGET_JSON):
        print(f"❌ 错误: 找不到 {TARGET_JSON}")
        return

    with open(TARGET_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # 3. 遍历并注入
    match_count = 0
    missing_count = 0

    for p in products:
        p_id = str(p.get('id')) # 确保是字符串
        
        if p_id in id_map:
            p['typeid'] = id_map[p_id]
            match_count += 1
        else:
            # 如果找不到，可以设为 None 或者默认值
            p['typeid'] = None 
            missing_count += 1
            # print(f"⚠️ ID {p_id} 在 CSV 中找不到 typeid")

    # 4. 保存
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print("-" * 30)
    print(f"🎉 合并完成!")
    print(f"✅ 成功匹配: {match_count}")
    print(f"⚠️ 未能匹配: {missing_count}")
    print(f"💾 结果已保存至: {OUTPUT_JSON}")
    print("-" * 30)
    print("👉 下一步: 请将生成的 products_with_typeid.json 重命名为 products_merged.json (如果确认无误)")

if __name__ == "__main__":
    main()