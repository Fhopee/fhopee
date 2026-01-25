import fs from 'fs';
import path from 'path';

// 目标 L2 分类列表 (来自 lib/category-config.ts)
const TARGET_CATEGORIES = [
  "Semiauto horizontal wrapper",
  "Automatic horizontal stretch wrapper",
  "Customize orbital wrapper",
  "Semi-auto pallet wrapping machine",
  "Automatic pallet wrapping machine",
  "Rotary arm wrapping machine",
  "Rotary ring stretch wrapping machine",
  "Automatic PET Strapping Machine",
  "Steel coil strapping machines",
  "Steel tube strapping machine",
  "Steel wire strapping machine",
  "L-Bar Shrink Wrap Machine",
  "Side Seal Shrink Wrap Machine",
  "Shrink Bundling Machine",
  "Horizontal Flow Shrinking Machine",
  "Automatic Shrink Wrapping Machine",
  "Hose packaging machine",
  "Steel coil wrapping machine",
  "Wire coil wrapping machine",
  "Copper coil packing machine",
  "Pipe packing machine",
  "Cable packing machine",
  "Bearing packing machine",
  "Aluminum Coil Packaging Machine",
  "Tyre packing machines",
  "Plastic Pipe Packing Line",
  "Aluminum profile packing line",
  "Automatic Wire Packing Line",
  "Automatic Rod Packing Line",
  "Automatic Steel Tube Packing Line",
  "Automatic Coil Packing Line",
  "Slit Coil Packing Line",
  "Copper Coil Packing Line",
  "Master Steel Coil Stretch Wrapper",
  "Pallet Inverter",
  "Stationary Pallet Inverter",
  "Mobile Pallet Changer",
  "Pallet Changer",
  "Inline Pallet Changer",
  "Vertical Automatic Coiler",
  "Horizontal Automatic Coiler",
  "Automatic Cable Coiler",
  "Upender",
  "Mechanical upender",
  "Hydraulic upender",
  "Hydraulic Dumper",
  "Mold upender",
  "Mold Flipper",
  "Coil Upender",
  "Auto Bagger",
  "Table Roll Auto Bagger",
  "Horizontal auto bagger"
];

// 关键词映射规则 (关键词 -> 目标分类)
// 越具体的规则放越前面
const KEYWORD_RULES: Record<string, string> = {
  "horizontal orbital": "Automatic horizontal stretch wrapper",
  "orbital wrapper": "Customize orbital wrapper",
  "pallet wrapping": "Automatic pallet wrapping machine",
  "pallet wrapper": "Automatic pallet wrapping machine",
  "rotary arm": "Rotary arm wrapping machine",
  "ring stretch": "Rotary ring stretch wrapping machine",
  "pet strap": "Automatic PET Strapping Machine",
  "coil strap": "Steel coil strapping machines",
  "tube strap": "Steel tube strapping machine",
  "wire strap": "Steel wire strapping machine",
  "shrink wrap": "Automatic Shrink Wrapping Machine",
  "hose": "Hose packaging machine",
  "steel coil wrap": "Steel coil wrapping machine",
  "wire coil": "Wire coil wrapping machine",
  "copper coil": "Copper coil packing machine",
  "pipe pack": "Pipe packing machine",
  "cable pack": "Cable packing machine",
  "bearing": "Bearing packing machine",
  "aluminum coil": "Aluminum Coil Packaging Machine",
  "tyre": "Tyre packing machines",
  "tire": "Tyre packing machines",
  "plastic pipe": "Plastic Pipe Packing Line",
  "profile pack": "Aluminum profile packing line",
  "wire pack": "Automatic Wire Packing Line",
  "rod pack": "Automatic Rod Packing Line",
  "steel tube pack": "Automatic Steel Tube Packing Line",
  "coil pack": "Automatic Coil Packing Line",
  "slit coil": "Slit Coil Packing Line",
  "pallet inverter": "Pallet Inverter",
  "pallet changer": "Pallet Changer",
  "vertical coiler": "Vertical Automatic Coiler",
  "horizontal coiler": "Horizontal Automatic Coiler",
  "cable coiler": "Automatic Cable Coiler",
  "mechanical upender": "Mechanical upender",
  "hydraulic upender": "Hydraulic upender",
  "hydraulic dumper": "Hydraulic Dumper",
  "mold upender": "Mold upender",
  "mold flipper": "Mold Flipper",
  "coil upender": "Coil Upender",
  "upender": "Upender",
  "tilter": "Upender",
  "bagger": "Auto Bagger",
  "bagging": "Auto Bagger",
  "coil wrapping machine": "Steel coil wrapping machine",
  "pallet-inverter": "Pallet Inverter",
  "pallet flipping": "Pallet Inverter",
  "pallet exchanger": "Pallet Changer",
  "steel-tube": "Automatic Steel Tube Packing Line",
  "door packing": "Automatic horizontal stretch wrapper",
  "box wrapper": "Automatic Shrink Wrapping Machine",
  "horizontal stretch wrapper": "Automatic horizontal stretch wrapper",
  "coil turner": "Coil Upender",
  "coil tipper": "Coil Upender",
  "autobag": "Auto Bagger",
  "cable coiling": "Automatic Cable Coiler"
};

const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products_ready.json');

async function main() {
  console.log('🧹 Starting Category Normalization...');

  if (!fs.existsSync(PRODUCTS_PATH)) {
    console.error('❌ Error: products_ready.json not found.');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
  let updatedCount = 0;

  const normalizedProducts = products.map((p: any) => {
    let newCategory = p.categoryName;
    let isUpdated = false;

    // 1. 如果当前分类已经是目标分类之一，保持不变 (忽略大小写差异，统一为目标格式)
    const exactMatch = TARGET_CATEGORIES.find(c => c.toLowerCase() === p.categoryName?.toLowerCase());
    if (exactMatch) {
      if (p.categoryName !== exactMatch) {
        newCategory = exactMatch;
        isUpdated = true;
      }
    } else {
      // 2. 如果不是目标分类，尝试通过关键词匹配
      // 优先使用 categoryName 匹配，如果不行则使用 productName 或 seoTitle
      const textToSearch = `${p.categoryName} ${p.productName} ${p.seoTitle}`.toLowerCase();
      
      for (const [keyword, target] of Object.entries(KEYWORD_RULES)) {
        if (textToSearch.includes(keyword)) {
          newCategory = target;
          isUpdated = true;
          break; // 找到第一个匹配的规则就停止
        }
      }
      
      // 3. 如果还是 "solution" 或 "Uncategorized" 且没匹配到，尝试归类为 "Customize orbital wrapper" (作为一个兜底，或者保持原样)
      if ((newCategory === 'solution' || newCategory === 'Uncategorized') && !isUpdated) {
         // 暂时保持原样，或者标记为需要人工审核
         // newCategory = "Uncategorized"; 
      }
    }

    if (isUpdated) {
      updatedCount++;
    }

    return {
      ...p,
      categoryName: newCategory
    };
  });

  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(normalizedProducts, null, 2));
  console.log(`✅ Success! Normalized ${updatedCount} products.`);
  
  // 打印未匹配的分类统计
  const remainingCounts: Record<string, number> = {};
  normalizedProducts.forEach((p: any) => {
    if (!TARGET_CATEGORIES.includes(p.categoryName)) {
      remainingCounts[p.categoryName] = (remainingCounts[p.categoryName] || 0) + 1;
    }
  });
  
  console.log('⚠️ Remaining Non-Standard Categories:', remainingCounts);
}

main().catch(console.error);

