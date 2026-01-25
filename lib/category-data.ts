export interface CategoryData {
  image: string;
  description: string;
  features?: string[];
}

// 默认图片（当没有特定图片时使用）
// 建议您准备一张通用的工厂或机械背景图命名为 default-factory-bg.jpg
export const DEFAULT_CATEGORY_IMAGE = "/images/categories/default-factory-bg.jpg";

// 这里配置每个分类的专属信息
// Key 必须是 slug (小写，横杠连接)
export const CATEGORY_METADATA: Record<string, CategoryData> = {
  "horizontal-orbital-stretch-wrapper": {
    image: "/images/categories/industrial-horizontal-stretch-wrapper-installation-maintenance-guide.webp",
    description: "High-performance horizontal orbital wrappers designed for securing long products like pipes, profiles, and timber.",
    features: ["Automated Operation", "Secure Wrapping", "Versatile Applications"]
  },
  "coil-packing-line": {
    image: "/images/categories/coil-packing-hero.jpg",
    description: "Fully automated packing lines designed for high-throughput steel and copper coil processing.",
  },
  "automatic-coil-packing-line": {
    image: "/images/categories/auto-coil-hero.jpg",
    description: "Advanced automation for seamless coil wrapping and stacking.",
  },
  // ... 在这里添加更多分类
};

// 辅助函数：获取分类数据
export function getCategoryData(slug: string): CategoryData {
  return CATEGORY_METADATA[slug] || {
    image: DEFAULT_CATEGORY_IMAGE,
    description: "Premium industrial machinery tailored for your production efficiency."
  };
}



