import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// 配置
const CSV_FILE = path.join(__dirname, '../dede_addonshop.csv');
const JSON_FILE = path.join(__dirname, '../data/products_deepseek_rewritten.json');
const BACKUP_FILE = path.join(__dirname, '../data/products_deepseek_rewritten.json.backup');

// 辅助：提取视频 ID（与 rewrite-products.ts 保持一致）
function extractYoutubeId(url: string): string {
  if (!url) return '';
  // 如果已经是11位的ID，直接返回
  if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }
  // 否则尝试从URL中提取
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

function main() {
  console.log('🚀 Starting YouTube ID sync process...');

  // 1. 备份现有JSON
  if (fs.existsSync(JSON_FILE)) {
    fs.copyFileSync(JSON_FILE, BACKUP_FILE);
    console.log('✅ Backup created:', BACKUP_FILE);
  }

  // 2. 读取CSV文件
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  // 3. 建立 aid -> videofile 映射
  const videoMap = new Map<string, string>();
  for (const record of records as any[]) {
    const aid = String(record.aid || '').trim();
    const videofile = String(record.videofile || '').trim();
    if (aid && videofile) {
      const youtubeId = extractYoutubeId(videofile);
      if (youtubeId) {
        videoMap.set(aid, youtubeId);
      }
    }
  }
  console.log(`📚 Found ${videoMap.size} products with video files in CSV`);

  // 4. 读取JSON文件
  console.log('📖 Reading JSON file...');
  const products = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

  // 5. 更新youtubeId
  let updatedCount = 0;
  let emptyCount = 0;
  let missingCount = 0;

  for (const product of products) {
    const id = String(product.id || '').trim();
    
    if (!id) {
      continue;
    }

    // 检查当前youtubeId是否为空或不存在
    const currentYoutubeId = product.youtubeId || '';
    const isEmpty = !currentYoutubeId || currentYoutubeId.trim() === '';

    if (videoMap.has(id)) {
      const newYoutubeId = videoMap.get(id)!;
      if (isEmpty || currentYoutubeId !== newYoutubeId) {
        product.youtubeId = newYoutubeId;
        updatedCount++;
      }
    } else {
      if (isEmpty) {
        emptyCount++;
      } else {
        // JSON中有值但CSV中没有，保持原值
      }
    }
  }

  // 6. 保存更新后的JSON
  fs.writeFileSync(JSON_FILE, JSON.stringify(products, null, 2));
  console.log('\n✅ Update complete!');
  console.log(`   - Updated: ${updatedCount} products`);
  console.log(`   - Still empty: ${emptyCount} products`);
  console.log(`   - Total products: ${products.length}`);
  console.log(`   - Products with video in CSV: ${videoMap.size}`);
}

if (require.main === module) {
  main().catch(console.error);
}

