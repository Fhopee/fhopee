import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Download, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { getProductBySlug, getRelatedProducts, type Product } from '@/lib/products';
import { getParentCategory } from '@/lib/category-config';
import { Metadata } from 'next';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductVideoSection from '@/components/ProductVideoSection';
import ContactButton from '@/components/ContactButton';
import ProductFAQ from '@/components/ProductFAQ';
import ProductCard from '@/components/ProductCard';

interface ProductPageProps {
  params: { slug: string };
}

// --- 工具函数：格式化 ---

// 简单的 slugify 函数 (与 Navbar 保持一致)
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// 1. 将驼峰命名转换为标题格式 (primaryApplication -> Primary Application)
const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1') // 在大写字母前加空格
    .replace(/^./, (str) => str.toUpperCase()) // 首字母大写
    .trim();
};

// 2. 格式化数值，处理对象或数组的情况
const formatSpecValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
  return String(value);
};

// --- SEO: 动态元数据 ---
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: product.seoTitle,
    description: product.metaDescription,
    openGraph: {
      title: product.seoTitle,
      description: product.metaDescription,
      images: [product.mainImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle,
      description: product.metaDescription,
      images: [product.mainImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  // If product not found, trigger Next.js 404
  if (!product) {
    notFound();
  }

  // Get parent category for breadcrumb
  const parentCategory = getParentCategory(product.categoryName);

  // Extract short description from metaDescription
  const shortDescription = product.metaDescription;

  // --- 智能参数分组逻辑 (Smart Layout) ---
  const allSpecs = Object.entries(product.specifications);
  const totalSpecsCount = allSpecs.length;
  
  // 获取相关产品
  const relatedProducts = getRelatedProducts(product.slug, product.categoryName, 4);
  
  // 定义核心参数关键词（用于优先展示）
  const priorityKeywords = ['application', 'capacity', 'speed', 'control', 'power', 'width', 'diameter', 'weight'];

  let topSectionSpecs: [string, any][] = [];
  let bottomSectionSpecs: [string, any][] = [];

  // 策略：如果参数总数少于 8 个，全部在顶部显示，底部不留空表格
  if (totalSpecsCount <= 8) {
    topSectionSpecs = allSpecs;
    bottomSectionSpecs = []; // 底部为空
  } else {
    // 策略：参数较多，执行拆分
    // 1. 先找核心参数
    topSectionSpecs = allSpecs.filter(([key]) => 
      priorityKeywords.some(keyword => key.toLowerCase().includes(keyword))
    );

    // 2. 如果核心参数不够 5 个，从剩下的里面补
    if (topSectionSpecs.length < 5) {
      const remaining = allSpecs.filter(s => !topSectionSpecs.includes(s));
      topSectionSpecs = [...topSectionSpecs, ...remaining.slice(0, 5 - topSectionSpecs.length)];
    }

    // 3. 限制顶部最多显示 6 个，保持美观
    topSectionSpecs = topSectionSpecs.slice(0, 6);

    // 4. 底部显示所有未在顶部出现的参数 (杜绝重复)
    bottomSectionSpecs = allSpecs.filter(([key]) => 
      !topSectionSpecs.find(([topKey]) => topKey === key)
    );
  }

  // --- Helper: Generate Breadcrumb Schema ---
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.yourdomain.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': parentCategory || 'Products',
        'item': parentCategory 
          ? `https://www.yourdomain.com/machine/${slugify(parentCategory)}`
          : `https://www.yourdomain.com/products`
      },
      // If we had L2 category link logic here, we could add position 3
      {
        '@type': 'ListItem',
        'position': 3, // Adjust position if we add L2
        'name': product.categoryName,
        'item': `https://www.yourdomain.com/machine/${slugify(parentCategory || '')}/${slugify(product.categoryName)}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': product.productName,
        // The last item typically doesn't need an 'item' URL if it's the current page, but Google recommends it
        'item': `https://www.yourdomain.com/products/${product.slug}`
      }
    ]
  };

  // --- Helper: Generate random review count between 1-100 ---
  // Use a simple hash of the product ID to make it "random" but deterministic (stable across reloads)
  const getReviewCount = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return (Math.abs(hash) % 100) + 1;
  };

  // --- SEO: Schema.org Product JSON-LD ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.productName,
    image: [product.mainImage, ...(product.gallery || [])],
    description: product.metaDescription,
    brand: {
      '@type': 'Brand',
      name: 'Industrial Solutions',
    },
    category: product.categoryName,
    sku: product.id,
    offers: {
      '@type': 'AggregateOffer', // Changed to AggregateOffer to support price range
      url: `https://yourdomain.com/products/${product.slug}`,
      priceCurrency: 'USD',
      lowPrice: '1111',  // Fixed low price
      highPrice: '9999', // Fixed high price
      offerCount: '1',
      availability: 'https://schema.org/InStock', // Always InStock
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: getReviewCount(product.id).toString(),
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            
            {parentCategory && (
              <>
                <Link
                  href={`/products?category=${encodeURIComponent(parentCategory)}`}
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  {parentCategory}
                </Link>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
              </>
            )}
            
            <Link
              href={`/products?category=${encodeURIComponent(product.categoryName)}`}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="text-gray-900 font-semibold">{product.productName}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          
          {/* Left Column - Image Gallery */}
          <ProductImageGallery
            productName={product.productName}
            mainImage={product.mainImage}
            gallery={product.gallery || []}
          />

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md">
                  {product.categoryName}
                </span>
                {product.isNew && (
                  <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-md">
                    New Arrival
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {product.productName}
              </h1>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 font-medium">Model:</span>
                <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-md">
                  {product.id}
                </span>
              </div>
            </div>

            {/* Short Description */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                {shortDescription}
              </p>
            </div>

            {/* Key Specs Box - 始终显示 */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">
                  {totalSpecsCount <= 8 ? "Specifications" : "Key Specifications"}
                </h2>
              </div>
              
              <div className="space-y-3">
                {topSectionSpecs.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-gray-300 font-medium">{formatKey(key)}:</span>
                      <span className="text-white font-semibold ml-2">
                        {formatSpecValue(value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-3">
              <ContactButton 
                productName={product.productName}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Request Quote
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </ContactButton>
              
              <div className="flex gap-3">
                <button className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Custom Engineering Available</h3>
                  <p className="text-sm text-gray-600">
                    Need modifications? Our team can tailor this solution to your specific requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Product Details (HTML Content) */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Product Description</h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
            </div>
            
            {/* 
                关键修改：添加 `prose-table:hidden` 类。
                这会强制隐藏 HTML 内容中自带的所有表格，防止与下方的 Technical Specifications 重复。
            */}
            <div
              className="prose prose-slate prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-4 prose-ul:space-y-2
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-a:text-blue-600 prose-a:font-semibold hover:prose-a:text-blue-700
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-table:border-collapse prose-table:w-full prose-table:my-8
                prose-th:bg-slate-100 prose-th:font-bold prose-th:text-gray-900 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-gray-300
                prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:text-gray-700
                prose-table:hidden"
              dangerouslySetInnerHTML={{ __html: (product as any).overview || product.fullContentHtml || '' }}
            />
          </div>
        </div>

        {/* Key Benefits List (Moved from Right Column) */}
        {product.features && product.features.length > 0 && (
          <div className="mb-12 bg-green-50/50 rounded-2xl p-8 lg:p-12 border border-green-100">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                Key Benefits
              </h2>
              <div className="h-1 w-20 bg-green-500 rounded-full"></div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-lg text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2.5 flex-shrink-0"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Video Section */}
        {product.youtubeId && product.youtubeId.trim() && (
          <ProductVideoSection
            youtubeId={product.youtubeId.trim()}
            title={`${product.productName} Video`}
            description={product.videoDescription}
            thumbnailImage={product.mainImage}
          />
        )}

        {/* Bottom Section - Detailed Specs (Only if needed) */}
        {/* 只有当有剩余参数时才显示此区域 */}
        {bottomSectionSpecs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-200">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Technical Specifications</h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="text-left py-4 px-6 text-white font-bold text-sm uppercase tracking-wider border-b-2 border-slate-700">
                      Specification
                    </th>
                    <th className="text-left py-4 px-6 text-white font-bold text-sm uppercase tracking-wider border-b-2 border-slate-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bottomSectionSpecs.map(([key, value], index) => (
                    <tr
                      key={key}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900 border-b border-gray-200">
                        {formatKey(key)}
                      </td>
                      <td className="py-4 px-6 text-gray-700 border-b border-gray-200">
                        {formatSpecValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <ProductFAQ 
          productName={product.productName} 
          categoryName={product.categoryName} 
          items={product.faq}
        />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="my-16 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-12 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your Production Line?
          </h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Get a customized quote for {product.productName} and discover how it can optimize your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ContactButton 
              productName={product.productName}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              Contact Sales Team
              <ChevronRight className="w-5 h-5" />
            </ContactButton>
            <button className="px-8 py-4 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 border-2 border-blue-400 transition-all duration-200">
              View Similar Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
