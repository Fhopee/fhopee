import Link from 'next/link';
import { Filter, ChevronRight } from 'lucide-react';
import { getAllProducts, getProductsByCategory } from '@/lib/products';
import { getL1Categories, getL2Categories, getParentCategory } from '@/lib/category-config';
import ProductCard from '@/components/ProductCard';
import ContactButton from '@/components/ContactButton';

// 简单的 slugify 函数 (与 Navbar 保持一致)
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

interface ProductsPageProps {
  searchParams: { category?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // 获取当前分类（从 URL 查询参数）
  const currentCategory = searchParams.category || '';
  
  // 获取所有 L1 分类（用于侧边栏）
  const l1Categories = getL1Categories();
  
  // 根据分类筛选产品
  const products = currentCategory 
    ? getProductsByCategory(currentCategory)
    : getAllProducts();
  
  // 确定当前 L1 分组（用于显示 L2 标签）
  let currentL1: string | null = null;
  if (currentCategory) {
    // 检查当前分类是否是 L1
    if (l1Categories.includes(currentCategory)) {
      currentL1 = currentCategory;
    } else {
      // 如果不是 L1，查找它的父分类
      currentL1 = getParentCategory(currentCategory);
    }
  }
  
  // 获取当前 L1 下的 L2 分类（用于标签栏）
  const l2Categories = currentL1 ? getL2Categories(currentL1) : [];
  
  // 页面标题
  const pageTitle = currentCategory || 'All Products';
  const pageDescription = currentCategory 
    ? `Explore our ${currentCategory.toLowerCase()} collection.`
    : 'Premium industrial machinery for your production line.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
        <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
          Products Catalog
        </span>
      </div>

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
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center ${
                    !currentCategory
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  All Products
                  {!currentCategory && <ChevronRight className="w-4 h-4" />}
                </Link>

                {/* L1 Category Links */}
                {l1Categories.map((category) => {
                  // 检查是否激活：当前分类正好是这个 L1，或者当前分类是这个 L1 的子分类
                  const isActive = currentCategory === category || 
                    (currentL1 === category);
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-gray-500 mt-1">{pageDescription}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
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
              <Link
                href={`/machine/${slugify(currentL1)}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  currentCategory === currentL1
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                All {currentL1}
              </Link>
              
              {/* L2 Category Tabs */}
              {l2Categories.map((l2Category) => {
                const isActive = currentCategory === l2Category;
                return (
                  <Link
                    key={l2Category}
                    href={`/machine/${slugify(l2Category)}`}
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
                {currentCategory 
                  ? `No products available in "${currentCategory}" category.`
                  : 'No products available at the moment.'}
              </p>
              {currentCategory && (
                <Link
                  href="/products"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all products →
                </Link>
              )}
            </div>
          )}

          {/* Pagination (Optional - can be implemented later) */}
          {products.length > 0 && (
            <div className="mt-16 flex justify-center">
              <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100 flex gap-1">
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-md transform hover:scale-105 transition-transform">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  3
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
