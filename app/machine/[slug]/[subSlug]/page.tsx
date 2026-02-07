import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Filter, ChevronRight } from 'lucide-react';
import { getProductsByCategory } from '@/lib/products';
import { getL1Categories, getL2Categories, getParentCategory } from '@/lib/category-config';
import ProductCard from '@/components/ProductCard';
import CategoryHero from '@/components/CategoryHero';
import { getCategoryData } from '@/lib/category-data';
import ContactButton from '@/components/ContactButton';

// 简单的 slugify 函数 (与 Navbar 保持一致)
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// 反向查找：根据 slug 找到真实的 Category Name
const getCategoryNameFromSlug = (slug: string) => {
  const allL1 = getL1Categories();
  // 1. 先找 L1 (虽然这个页面主要用于 L2，但以防万一)
  const l1Match = allL1.find(c => slugify(c) === slug);
  if (l1Match) return l1Match;

  // 2. 再找 L2
  for (const l1 of allL1) {
    const l2s = getL2Categories(l1);
    const l2Match = l2s.find(c => slugify(c) === slug);
    if (l2Match) return l2Match;
  }
  
  return null;
};

interface SubCategoryPageProps {
  params: { slug: string; subSlug: string };
}

export async function generateMetadata({ params }: SubCategoryPageProps) {
  const categoryName = getCategoryNameFromSlug(params.subSlug);
  
  if (!categoryName) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${categoryName} - Industrial Solutions`,
    description: `Explore our premium ${categoryName.toLowerCase()} collection. High-quality industrial machinery for your production line.`,
  };
}

import CategorySEOContent from '@/components/CategorySEOContent';

export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
  // 1. 获取当前二级分类名称
  const currentCategory = getCategoryNameFromSlug(params.subSlug);
  
  if (!currentCategory) {
    notFound();
  }

  // 2. 获取父级分类 (L1) 名称
  const parentCategory = getParentCategory(currentCategory);
  
  // 3. 校验 URL 的合法性：确保 L2 确实属于这个 L1 (params.slug)
  // 如果 parentCategory 不存在，或者其 slug 不匹配 params.slug，则视为 404
  if (!parentCategory || slugify(parentCategory) !== params.slug) {
     notFound();
  }

  // 4. 获取产品
  const products = getProductsByCategory(currentCategory);

  // 5. 获取同级的所有 L2 分类（用于标签栏）
  const siblingCategories = getL2Categories(parentCategory);

  // 6. 获取 Hero 数据 (使用父级分类的 slug，通常共享 Hero 图片)
  const parentCategoryData = getCategoryData(params.slug);
  
  // 获取当前二级分类的专属 SEO 数据
  // 如果没有配置二级分类的专属数据，它会回退到默认数据，这可能不是我们要的（因为会和 Hero 的描述重复）
  // 所以我们可以稍微修改 getCategoryData 的逻辑，或者直接在这里传当前 slug
  const currentCategorySEOData = getCategoryData(params.subSlug);
  
  // 7. 获取侧边栏的 L1 列表
  const l1Categories = getL1Categories();

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      
      {/* 全屏 Hero - 显示当前二级分类的信息 */}
      <CategoryHero 
        title={currentCategory}
        description={`Professional ${currentCategory.toLowerCase()} solutions tailored for your industry.`}
        imageSrc={parentCategoryData.image}
        parentCategory={parentCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar */}
          <aside className="lg:w-1/4 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Categories Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg">Categories</h2>
                </div>
                
                <nav className="space-y-2">
                  {/* All Products Link */}
                  <Link
                    href="/products"
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  >
                    All Products
                  </Link>

                  {/* L1 Category Links */}
                  {l1Categories.map((category) => {
                    const isActive = category === parentCategory;
                    return (
                      <Link
                        key={category}
                        href={`/machine/${slugify(category)}`}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        {category}
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Custom Engineering</h3>
                <p className="text-sm text-gray-300 mb-4 relative z-10 leading-relaxed">
                  Need a specific line configuration? We design tailored solutions.
                </p>
                <ContactButton className="w-full py-2.5 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors relative z-10 shadow-lg">
                  Contact Engineers
                </ContactButton>
              </div>
            </div>
          </aside>

          {/* Main Grid Area */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-3 text-sm ml-auto">
                <span className="text-gray-500">Sort by:</span>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:border-blue-400 transition-colors">
                  <option>Relevance</option>
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>

            {/* L2 Tabs Bar */}
            <div className="mb-8 flex flex-wrap gap-2">
              {/* "All [Parent Category]" Tab - Link back to L1 page */}
              <Link
                href={`/machine/${slugify(parentCategory)}`}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-600"
              >
                All {parentCategory}
              </Link>
              
              {/* L2 Category Tabs */}
              {siblingCategories.map((l2Category) => {
                const isActive = l2Category === currentCategory;
                return (
                  <Link
                    key={l2Category}
                    // 指向当前层级的兄弟页面
                    href={`/machine/${slugify(parentCategory)}/${slugify(l2Category)}`}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {l2Category}
                  </Link>
                );
              })}
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-sm">
                  No products available in "{currentCategory}" category.
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all products →
                </Link>
              </div>
            )}

            {/* SEO Content Block */}
            <CategorySEOContent 
              data={currentCategorySEOData} 
              categoryName={currentCategory} 
            />
          </main>
        </div>
      </div>
    </div>
  );
}
