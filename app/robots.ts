import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // ⚠️ 请替换为您的实际域名，或者配置环境变量 process.env.NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yourdomain.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // 如果有私有目录可以屏蔽
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
