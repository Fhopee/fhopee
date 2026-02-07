import { readFileSync } from 'fs';
import { join } from 'path';
import { cache } from 'react';
import { CATEGORY_HIERARCHY } from './category-config';

/**
 * Product 接口定义，严格匹配 JSON 结构
 */
export interface Product {
  id: string;
  productName: string;
  categoryName: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  overview?: string; // New field
  features?: string[]; // New field
  faq?: { question: string; answer: string }[]; // New field
  fullContentHtml?: string; // Deprecated but kept for backward compatibility
  mainImage: string;
  gallery: string[];
  specifications: Record<string, string>;
  youtubeId?: string;
  videoDescription?: string;
  type?: 'product' | 'category';
  isNew?: boolean;
}

/**
 * 读取并解析产品数据（带缓存）
 * 使用 React cache 函数确保在同一个请求中只读取一次文件
 */
const loadProductsData = cache((): Product[] => {
  try {
    const filePath = join(process.cwd(), 'data', 'products_ready.json');
    console.log('Loading products from:', filePath);
    const fileContents = readFileSync(filePath, 'utf-8');
    const products: Product[] = JSON.parse(fileContents);
    console.log('Loaded products count:', products.length);
    return products;
  } catch (error) {
    console.error('Error loading products data:', error);
    // 如果 data/products_ready.json 不存在，尝试根目录的 products_ready.json
    try {
      const fallbackPath = join(process.cwd(), 'products_ready.json');
      const fileContents = readFileSync(fallbackPath, 'utf-8');
      const products: Product[] = JSON.parse(fileContents);
      return products;
    } catch (fallbackError) {
      console.error('Error loading fallback products data:', fallbackError);
      return [];
    }
  }
});

/**
 * 获取所有产品
 * @returns 所有产品的数组
 */
export function getAllProducts(): Product[] {
  return loadProductsData();
}

/**
 * 获取所有分类（去重）
 * 确保 'All Products' 不在列表中
 * @returns 分类名称的字符串数组
 */
export function getAllCategories(): string[] {
  const products = loadProductsData();
  const categories = new Set<string>();
  
  products.forEach((product) => {
    if (product.categoryName && product.categoryName !== 'All Products') {
      categories.add(product.categoryName);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * 根据 slug 查找单个产品
 * @param slug - 产品的 slug
 * @returns 匹配的产品，如果未找到则返回 undefined
 */
export function getProductBySlug(slug: string): Product | undefined {
  const products = loadProductsData();
  return products.find((product) => product.slug === slug);
}

/**
 * 根据分类名筛选产品
 * @param category - 分类名称（可以是 L1 或 L2）
 * @returns 属于该分类的产品数组
 */
export function getProductsByCategory(category: string): Product[] {
  const products = loadProductsData();
  
  // 如果分类是 'All Products'，返回所有产品
  if (category === 'All Products') {
    return products;
  }
  
  // 检查是否是 L1 分类（Parent）
  if (category in CATEGORY_HIERARCHY) {
    // 如果是 L1，返回所有子分类（L2）的产品
    const l2Categories = CATEGORY_HIERARCHY[category];
    return products.filter((product) => 
      l2Categories.includes(product.categoryName)
    );
  }
  
  // 如果不是 L1，则按 L2 精确匹配
  return products.filter((product) => product.categoryName === category);
}

/**
 * 获取相关产品
 * 逻辑：优先获取同 L2 分类的产品，排除当前产品
 * @param currentSlug - 当前产品的 slug (用于排除自己)
 * @param categoryName - 当前产品的分类名
 * @param limit - 返回数量限制 (默认 4)
 */
export function getRelatedProducts(currentSlug: string, categoryName: string, limit: number = 4): Product[] {
  // 1. 获取同分类下的所有产品
  const categoryProducts = getProductsByCategory(categoryName);
  
  // 2. 过滤掉当前产品
  const filtered = categoryProducts.filter(p => p.slug !== currentSlug);
  
  // 3. 如果同分类产品不足，可以考虑从 L1 父分类补充 (这里暂只做简单的同类推荐)
  // 如果产品数量很多，可以考虑随机打乱一下，避免每次都显示前 4 个
  // const shuffled = filtered.sort(() => 0.5 - Math.random()); 
  
  return filtered.slice(0, limit);
}