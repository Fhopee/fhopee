import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { parse } from 'csv-parse/sync';
import 'dotenv/config';

// --- 配置区域 ---
const INPUT_CSV = path.join(process.cwd(), 'dede_addonshop.csv');
const OUTPUT_JSON = path.join(process.cwd(), 'data', 'products_deepseek_rewritten.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// 检查 API Key
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ Error: DEEPSEEK_API_KEY is missing in .env file.');
  process.exit(1);
}

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 核心 Prompt 设计
const SYSTEM_PROMPT = `
# Role
You are a professional industrial copywriter and SEO specialist for "Industrial Solutions".

# Task
Rewrite the provided raw product data into structured JSON for a B2B e-commerce website. 
IMPORTANT: The input data might be in mixed languages. You must output **ONLY IN ENGLISH**.

# Input Data
Product Name: {product_name}
Raw HTML Content: {raw_html_body}
Raw Features: {raw_features}

# Constraints & Guidelines (CRITICAL)
1. **English Only**: Even if the input is Chinese or other languages, translate and rewrite everything into professional English.
2. **NO Hallucinations**: Do NOT invent technical specs. If missing, omit.
3. **Tone**: Professional, authoritative, benefit-oriented.
4. **Formatting**: CamelCase keys to Title Case.

# Output Format (JSON Only)
{
  "seoTitle": "String (50-60 chars)",
  "metaDescription": "String (150-160 chars)",
  "overview": "HTML String (<p> tags only, no tables)",
  "features": ["String", "String"],
  "specifications": { "Key": "Value" },
  "faq": [ { "question": "String", "answer": "String" } ]
}
`;

// 备份函数
function backupData() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // 备份 CSV
  if (fs.existsSync(INPUT_CSV)) {
    fs.copyFileSync(INPUT_CSV, path.join(BACKUP_DIR, `dede_addonshop_${timestamp}.csv.bak`));
    console.log('✅ CSV Backup created.');
  }

  // 备份已有的 JSON (如果存在)
  if (fs.existsSync(OUTPUT_JSON)) {
    fs.copyFileSync(OUTPUT_JSON, path.join(BACKUP_DIR, `products_rewritten_${timestamp}.json.bak`));
    console.log('✅ Existing JSON Backup created.');
  }
}

// 辅助：提取视频 ID
function extractYoutubeId(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

// 辅助：检测是否为英文内容
function isEnglishContent(text: string): boolean {
  if (!text) return false;
  // 检测是否包含中文字符 (最常见的非英文情况)
  if (/[\u4e00-\u9fa5]/.test(text)) return false;
  
  // 检测西里尔字母 (俄语)
  if (/[\u0400-\u04FF]/.test(text)) return false;

  // 检测日文 (平假名/片假名)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return false;

  // 检测韩文
  if (/[\uAC00-\uD7AF]/.test(text)) return false;

  return true;
}

// 重写单个产品
async function rewriteProduct(record: any) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Product Name: ${record.seotitle}\nRaw HTML: ${record.body}\nRaw Features: ${record.Feacture}` 
        }
      ],
      model: "deepseek-chat",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response");
    
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error rewriting ${record.seotitle}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting DeepSeek Rewrite Process...');
  
  // 1. 执行备份
  backupData();

  // 2. 读取 CSV
  const fileContent = fs.readFileSync(INPUT_CSV, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });
  
  console.log(`📦 Loaded ${records.length} records.`);

  // 3. 筛选英文数据
  let rewrittenProducts: any[] = [];
  let processedIds = new Set<string>();

  // 加载现有进度
  if (fs.existsSync(OUTPUT_JSON)) {
    try {
      const data = fs.readFileSync(OUTPUT_JSON, 'utf-8');
      rewrittenProducts = JSON.parse(data);
      rewrittenProducts.forEach(p => processedIds.add(String(p.id)));
      console.log(`🔄 Resuming from existing file: ${rewrittenProducts.length} products already processed.`);
    } catch (e) {
      console.error("⚠️ Error reading existing JSON, starting fresh.");
    }
  }
  
  // ⚠️ 生产模式：处理所有符合条件的英文数据
  const TEST_LIMIT = Infinity; 
  let processedCount = 0;
  console.log(`🚀 PRODUCTION MODE: Processing ALL English records.`);

  for (const record of records as any[]) {
    // 0. 检查是否已处理
    if (processedIds.has(String(record.aid))) {
      // console.log(`Skipping already processed ID: ${record.aid}`);
      continue;
    }

    // 1. 语言检测：检查标题和 SEO 描述
    const title = record.seotitle || record.title || '';
    const contentToCheck = title + (record.seodescription || '');
    
    if (!isEnglishContent(contentToCheck)) {
      // console.log(`Skipping non-English content: ${title.substring(0, 20)}...`);
      continue;
    }

    // 2. 检查是否达到测试限制
    if (processedCount >= TEST_LIMIT) {
      break;
    }

    console.log(`Processing [${rewrittenProducts.length + 1}]: ${title}...`);
    
    const rewrittenData = await rewriteProduct(record);
    
    if (rewrittenData) {
      const product = {
        id: record.aid,
        ...rewrittenData, // 覆盖 DeepSeek 生成的字段
        mainImage: record.litpic1 || '/images/placeholder.jpg',
        gallery: [record.litpic1, record.litpic2, record.litpic3, record.litpic4].filter(Boolean),
        youtubeId: extractYoutubeId(record.videofile),
        isNew: false
      };
      rewrittenProducts.push(product);
      processedIds.add(String(record.aid));
      processedCount++; // 成功处理才计数

      // 实时保存：每成功处理一条就保存
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(rewrittenProducts, null, 2));
    }

    // 速率限制 (1秒/条)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. 最终保存（以防万一）
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(rewrittenProducts, null, 2));
  console.log(`✅ Success! Saved ${rewrittenProducts.length} rewritten products to ${OUTPUT_JSON}`);
}

main().catch(console.error);
