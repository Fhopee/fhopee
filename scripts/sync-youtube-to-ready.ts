import * as fs from 'fs';
import * as path from 'path';

// 配置
const REWRITTEN_JSON = path.join(__dirname, '../data/products_deepseek_rewritten.json');
const READY_JSON = path.join(__dirname, '../data/products_ready.json');
const BACKUP_FILE = path.join(__dirname, '../data/products_ready.json.backup');

function main() {
  console.log('🚀 Starting YouTube ID sync to products_ready.json...');

  // 1. 备份现有文件
  if (fs.existsSync(READY_JSON)) {
    fs.copyFileSync(READY_JSON, BACKUP_FILE);
    console.log('✅ Backup created:', BACKUP_FILE);
  }

  // 2. 读取两个文件
  console.log('📖 Reading files...');
  const rewrittenData = JSON.parse(fs.readFileSync(REWRITTEN_JSON, 'utf-8'));
  const readyData = JSON.parse(fs.readFileSync(READY_JSON, 'utf-8'));

  // 3. 建立映射表：id -> youtubeId
  const youtubeMap = new Map<string, string>();
  for (const product of rewrittenData) {
    const id = String(product.id || '').trim();
    const youtubeId = String(product.youtubeId || '').trim();
    if (id && youtubeId) {
      youtubeMap.set(id, youtubeId);
    }
  }
  console.log(`📚 Found ${youtubeMap.size} products with youtubeId in rewritten file`);

  // 4. 更新 products_ready.json
  let updatedCount = 0;
  let addedCount = 0;

  for (const product of readyData) {
    const id = String(product.id || '').trim();
    if (!id) continue;

    if (youtubeMap.has(id)) {
      const newYoutubeId = youtubeMap.get(id)!;
      const currentYoutubeId = String(product.youtubeId || '').trim();
      
      if (currentYoutubeId !== newYoutubeId) {
        product.youtubeId = newYoutubeId;
        if (currentYoutubeId) {
          updatedCount++;
        } else {
          addedCount++;
        }
      }
    }
  }

  // 5. 保存更新后的文件
  fs.writeFileSync(READY_JSON, JSON.stringify(readyData, null, 2));
  
  console.log('\n✅ Sync complete!');
  console.log(`   - Updated existing: ${updatedCount} products`);
  console.log(`   - Added new: ${addedCount} products`);
  console.log(`   - Total products in ready: ${readyData.length}`);
  console.log(`   - Products with youtubeId now: ${readyData.filter((p: any) => p.youtubeId && p.youtubeId.trim()).length}`);
}

if (require.main === module) {
  main();
}


