import fs from 'fs';
import path from 'path';

const BROKEN_JSON_PATH = path.join(process.cwd(), 'data', 'products_ready.json');
const BACKUP_JSON_PATH = path.join(process.cwd(), 'data', 'products_ready.json.bak_20260125');

// 简单的 slugify 函数
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

async function main() {
  console.log('🔧 Starting Product Data Repair...');

  if (!fs.existsSync(BROKEN_JSON_PATH) || !fs.existsSync(BACKUP_JSON_PATH)) {
    console.error('❌ Error: Missing input files.');
    process.exit(1);
  }

  const brokenProducts = JSON.parse(fs.readFileSync(BROKEN_JSON_PATH, 'utf-8'));
  const backupProducts = JSON.parse(fs.readFileSync(BACKUP_JSON_PATH, 'utf-8'));

  console.log(`📦 Loaded ${brokenProducts.length} broken products.`);
  console.log(`📦 Loaded ${backupProducts.length} backup products.`);

  // 创建备份数据的映射
  const backupMap = new Map();
  backupProducts.forEach((p: any) => {
    backupMap.set(String(p.id), p);
  });

  let repairedCount = 0;
  const repairedProducts = brokenProducts.map((p: any) => {
    const backup = backupMap.get(String(p.id));

    if (backup) {
      repairedCount++;
      return {
        ...p,
        categoryName: backup.categoryName,
        slug: backup.slug || slugify(p.seoTitle || p.productName || ''),
        productName: backup.productName || p.seoTitle, // 优先使用备份的名称，或者 SEO 标题
        // 保留其他新生成的字段
      };
    } else {
      console.warn(`⚠️ Warning: No backup found for ID ${p.id}. Generating basic slug/category.`);
      return {
        ...p,
        categoryName: 'Uncategorized', // 临时分类
        slug: slugify(p.seoTitle || 'product-' + p.id),
        productName: p.seoTitle || `Product ${p.id}`
      };
    }
  });

  fs.writeFileSync(BROKEN_JSON_PATH, JSON.stringify(repairedProducts, null, 2));
  console.log(`✅ Success! Repaired ${repairedCount} products.`);
}

main().catch(console.error);




