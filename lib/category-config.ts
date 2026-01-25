// lib/category-config.ts

// 定义分类层级关系
// Key (左侧) = L1 一级大类（显示在 Sidebar）
// Value (数组) = L2 二级子类（显示在顶部 Tabs，必须与 JSON 中的 categoryName 完全匹配）

export const CATEGORY_HIERARCHY: Record<string, string[]> = {
  "Horizontal Orbital Stretch Wrapper": [
    "Semiauto horizontal wrapper",
    "Automatic horizontal stretch wrapper",
    "Customize orbital wrapper"
  ],
  "Stretch Wrapping Machine": [
    "Semi-auto pallet wrapping machine",
    "Automatic pallet wrapping machine",
    "Rotary arm wrapping machine",
    "Rotary ring stretch wrapping machine"
  ],
  "Automatic Strapping Machine": [
    "Automatic PET Strapping Machine",
    "Steel coil strapping machines",
    "Steel tube strapping machine",
    "Steel wire strapping machine"
  ],
  "Shrink Wrap Machine": [
    "L-Bar Shrink Wrap Machine",
    "Side Seal Shrink Wrap Machine",
    "Shrink Bundling Machine",
    "Horizontal Flow Shrinking Machine",
    "Automatic Shrink Wrapping Machine"
  ],
  "Coil Packing Machine": [
    "Hose packaging machine",
    "Steel coil wrapping machine",
    "Wire coil wrapping machine",
    "Copper coil packing machine",
    "Pipe packing machine",
    "Cable packing machine",
    "Bearing packing machine",
    "Aluminum Coil Packaging Machine",
    "Tyre packing machines"
  ],
  "Automatic Packing Line": [
    "Plastic Pipe Packing Line",
    "Aluminum profile packing line",
    "Automatic Wire Packing Line",
    "Automatic Rod Packing Line",
    "Automatic Steel Tube Packing Line" // ID 138
  ],
  "Coil Packing Line": [
    "Automatic Coil Packing Line", // ID 136
    "Slit Coil Packing Line",
    "Copper Coil Packing Line",
    "Master Steel Coil Stretch Wrapper"
  ],
  "Pallet Inverter & Changer": [
    "Pallet Inverter", // ID 250 (如果它本身也有产品)
    "Stationary Pallet Inverter",
    "Mobile Pallet Changer",
    "Pallet Changer",
    "Inline Pallet Changer"
  ],
  "Automatic Coiler": [
    "Vertical Automatic Coiler",
    "Horizontal Automatic Coiler",
    "Automatic Cable Coiler"
  ],
  "Upender & Tilter": [
    "Upender", // ID 131
    "Mechanical upender",
    "Hydraulic upender",
    "Hydraulic Dumper",
    "Mold upender",
    "Mold Flipper",
    "Coil Upender"
  ],
  "Auto Bagging Machine": [
    "Auto Bagger", // ID 353
    "Table Roll Auto Bagger",
    "Horizontal auto bagger"
  ]
};

// 辅助函数：获取所有一级分类
export function getL1Categories() {
  return Object.keys(CATEGORY_HIERARCHY);
}

// 辅助函数：根据一级分类获取其下的二级分类
export function getL2Categories(l1Category: string) {
  return CATEGORY_HIERARCHY[l1Category] || [];
}

// 辅助函数：反向查找（给一个子类名，找到它属于哪个大类）
// 用于面包屑导航
export function getParentCategory(childCategory: string): string | null {
  for (const [parent, children] of Object.entries(CATEGORY_HIERARCHY)) {
    if (children.includes(childCategory)) {
      return parent;
    }
  }
  return null;
}