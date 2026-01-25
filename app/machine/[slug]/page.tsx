import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Filter, ChevronRight } from 'lucide-react';
import { getAllProducts, getProductsByCategory } from '@/lib/products';
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
// 这是一个简单的实现，实际项目中可能需要更高效的查找表
const getCategoryNameFromSlug = (slug: string) => {
  const allL1 = getL1Categories();
  // 1. 先找 L1
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

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { category?: string };
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
  // 基础分类（L1 或 L2，取决于 URL）
  const baseCategory = getCategoryNameFromSlug(params.slug);
  
  // 实际显示的分类（优先取 URL 参数中的 category，否则取 baseCategory）
  const displayCategory = searchParams.category || baseCategory;
  
  if (!displayCategory) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${displayCategory} - Industrial Solutions`,
    description: `Explore our premium ${displayCategory.toLowerCase()} collection. High-quality industrial machinery for your production line.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // 1. 确定当前页面的“上下文分类”（通常是 L1，但也可能是直接访问的 L2）
  const contextCategory = getCategoryNameFromSlug(params.slug);
  
  if (!contextCategory) {
    notFound();
  }

  // 2. 确定“活跃分类”（用于筛选产品）
  // 如果 URL 参数中有 category，则使用它；否则使用上下文分类
  const activeCategory = searchParams.category || contextCategory;

  // 3. 获取所有 L1 分类（用于侧边栏）
  const l1Categories = getL1Categories();
  
  // 4. 根据活跃分类筛选产品
  const products = getProductsByCategory(activeCategory);
  
  // 5. 确定当前 L1 分组（用于显示 L2 标签和侧边栏高亮）
  let currentL1: string | null = null;
  
  if (l1Categories.includes(contextCategory)) {
    // 如果上下文本身就是 L1
    currentL1 = contextCategory;
  } else {
    // 如果上下文是 L2，找到它的父分类
    currentL1 = getParentCategory(contextCategory);
  }
  
  // 6. 获取当前 L1 下的 L2 分类（用于标签栏）
  const l2Categories = currentL1 ? getL2Categories(currentL1) : [];
  
  // 7. 获取 Hero 数据 (使用上下文分类的 slug，保持 Hero 不变)
  // 如果 activeCategory 是 L2，我们可能还是想显示 L1 的 Hero，或者显示 L2 专属的（如果有配置）
  // 这里策略是：Hero 始终显示当前 URL 对应的主题（即 contextCategory）
  // 这样切换 Tab 时 Hero 不会闪烁，符合“保持在当前页面”的意图
  const categoryData = getCategoryData(params.slug);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      
      {/* 全屏 Hero - 始终显示 contextCategory 的信息 */}
      <CategoryHero 
        title={contextCategory}
        description={categoryData.description}
        imageSrc={categoryData.image}
        parentCategory={currentL1 !== contextCategory ? currentL1 : null}
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
                    // 侧边栏高亮逻辑：
                    // 如果当前上下文是 L1，则高亮该 L1
                    // 如果当前上下文是 L2，则高亮其父 L1
                    const isActive = currentL1 === category;
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

            {/* L2 Tabs Bar - Show when an L1 is selected */}
            {currentL1 && l2Categories.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {/* "All [L1 Name]" Tab */}
                {/* 链接到当前页面路径，不带参数 = 显示所有 */}
                <Link
                  href={`/machine/${slugify(currentL1)}`}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === currentL1
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  All {currentL1}
                </Link>
                
                {/* L2 Category Tabs */}
                {l2Categories.map((l2Category) => {
                  const isActive = activeCategory === l2Category;
                  return (
                    <Link
                      key={l2Category}
                      // 使用查询参数而不是跳转新页面
                      href={`/machine/${slugify(currentL1)}?category=${encodeURIComponent(l2Category)}`}
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
            )}

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
                  {activeCategory 
                    ? `No products available in "${activeCategory}" category.`
                    : 'No products available at the moment.'}
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all products →
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
