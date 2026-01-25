import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'data', 'products_ready.json');
const CSV_PATH = path.join(process.cwd(), 'dede_addonshop.csv');

// 映射表：typeid -> Category Name
// 基于用户截图构建
const TYPEID_MAP: Record<string, string> = {
  // Horizontal Orbital Stretch Wrapper
  '120': 'Semiauto horizontal wrapper',
  '121': 'Automatic horizontal stretch wrapper',
  '122': 'Customize orbital wrapper',
  
  // Stretch Wrapping Machine
  '124': 'Semi-auto pallet wrapping machine',
  '126': 'Automatic pallet wrapping machine',
  '127': 'Rotary arm wrapping machine',
  '129': 'Rotary ring stretch wrapping machine',
  
  // Automatic Strapping Machine
  '390': 'Automatic PET Strapping Machine',
  '346': 'Steel coil strapping machines',
  '347': 'Steel tube strapping machine',
  '348': 'Steel wire strapping machine',
  
  // Shrink Wrap Machine
  '273': 'L-Bar Shrink Wrap Machine',
  '274': 'Side Seal Shrink Wrap Machine',
  '280': 'Shrink Bundling Machine',
  '282': 'Horizontal Flow Shrinking Machine',
  '281': 'Automatic Shrink Wrapping Machine',
  
  // Pallet Inverter
  '300': 'Stationary Pallet Inverter',
  '299': 'Mobile Pallet Changer',
  '301': 'Pallet Changer',
  '344': 'Inline Pallet Changer',
  
  // Automatic Coiler
  '174': 'Vertical Automatic Coiler',
  '173': 'Horizontal Automatic Coiler',
  '259': 'Automatic Cable Coiler',
  
  // Coil Packing Machine
  '152': 'Hose packaging machine',
  '141': 'Steel coil wrapping machine',
  '142': 'Wire coil wrapping machine',
  '143': 'Copper coil packing machine',
  '144': 'Pipe packing machine',
  '145': 'Cable packing machine',
  '169': 'Bearing packing machine',
  '363': 'Aluminum Coil Packaging Machine',
  '153': 'Tyre packing machines',
  
  // Automatic Steel Tube Packing Line
  '138': 'Automatic Steel Tube Packing Line',
  
  // Automatic Coil Packing Line
  '395': 'Slit Coil Packing Line',
  
  // Automatic Packing Line
  '247': 'Master Steel Coil Stretch Wrapper',
  '246': 'Plastic Pipe Packing Line',
  '266': 'Aluminum profile packing line',
  '297': 'Automatic Wire Packing Line',
  '365': 'Copper Coil Packing Line',
  '377': 'Automatic Rod Packing Line',
  
  // Auto Bagger
  '354': 'Table Roll Auto Bagger',
  '355': 'Horizontal auto bagger',
  
  // Upender
  '132': 'Mechanical upender',
  '134': 'Hydraulic upender',
  '367': 'Hydraulic Dumper',
  '369': 'Mold upender',
  '370': 'Mold Flipper',
  '385': 'Coil Upender'
};

async function main() {
  console.log('🧹 Starting Strict Filtering & Mapping...');

  // 1. Load CSV to get typeid map
  if (!fs.existsSync(CSV_PATH)) {
    console.error('❌ Error: CSV file not found.');
    process.exit(1);
  }
  console.log('Loading CSV...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, { columns: true, skip_empty_lines: true });
  
  // Build aid -> typeid map
  const aidToTypeid = new Map<string, string>();
  records.forEach((r: any) => {
    aidToTypeid.set(r.aid, r.typeid);
  });
  console.log(`Loaded ${aidToTypeid.size} CSV records.`);

  // 2. Load Products JSON
  if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
    console.error('❌ Error: products_ready.json not found.');
    process.exit(1);
  }
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
  console.log(`Loaded ${products.length} products from JSON.`);

  // 3. Filter and Update
  const keptProducts: any[] = [];
  const removedCounts: Record<string, number> = {};
  
  products.forEach((p: any) => {
    const typeid = aidToTypeid.get(String(p.id));
    
    if (!typeid) {
      // ID not in CSV? Should not happen usually
      // console.warn(`⚠️ Warning: Product ID ${p.id} not found in CSV.`);
      return;
    }

    const validCategory = TYPEID_MAP[typeid];
    
    if (validCategory) {
      // Keep and update category
      keptProducts.push({
        ...p,
        categoryName: validCategory,
        typeid: typeid // Add typeid for reference
      });
    } else {
      // Remove
      removedCounts[typeid] = (removedCounts[typeid] || 0) + 1;
    }
  });

  // 4. Save
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(keptProducts, null, 2));
  
  console.log(`✅ Filtering Complete.`);
  console.log(`   Original: ${products.length}`);
  console.log(`   Kept:     ${keptProducts.length}`);
  console.log(`   Removed:  ${products.length - keptProducts.length}`);
  
  // Show top removed typeids (to verify we are removing the right things)
  const sortedRemoved = Object.entries(removedCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  console.log('Top removed typeids:', sortedRemoved);
}

main().catch(console.error);


