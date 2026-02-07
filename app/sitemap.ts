import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/products';
import { getL1Categories, getL2Categories } from '@/lib/category-config';

// 简单的 slugify 工具函数 (需保持与页面逻辑一致)
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export default function sitemap(): MetadataRoute.Sitemap {
  // ⚠️ 请替换为您的实际域名
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yourdomain.com';
  
  // 1. 静态页面
  const staticRoutes = [
    '',           // Home
    '/products',  // All Products Directory
    '/contact',   // Contact Page
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. 动态分类页 (L1 Categories & L2 Categories)
  const l1Categories = getL1Categories();
  
  // L1 路由
  const l1Routes = l1Categories.map((category) => ({
    url: `${baseUrl}/machine/${slugify(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // L2 路由
  const l2Routes = l1Categories.flatMap((l1) => {
    const l2s = getL2Categories(l1);
    return l2s.map((l2) => ({
      url: `${baseUrl}/machine/${slugify(l1)}/${slugify(l2)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  });

  const categoryRoutes = [...l1Routes, ...l2Routes];

  // 3. 动态产品页 (Products)
  const products = getAllProducts();
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(), // 如果产品数据里有更新时间，可以用那个
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
