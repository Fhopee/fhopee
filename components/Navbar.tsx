'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, Factory, ChevronDown, ChevronRight } from 'lucide-react';
import { getL1Categories, getL2Categories } from '@/lib/category-config';

// 简单的 slugify 函数，用于前端
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 获取分类列表
  const categories = getL1Categories();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-gray-900">Industrial Solutions</div>
              <div className="text-xs text-gray-500">Packaging & Automation</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            
            {/* Products Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none"
              >
                Products
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isProductsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-[calc(100vh-200px)] overflow-y-visible custom-scrollbar">
                    <Link
                      href="/products"
                      onClick={() => setIsProductsDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 border-b border-gray-50"
                    >
                      View All Products
                    </Link>
                    {categories.map((category) => {
                      const l2Categories = getL2Categories(category);
                      return (
                        <div key={category} className="group relative">
                          <Link
                            href={`/machine/${slugify(category)}`}
                            onClick={() => setIsProductsDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          >
                            <span>{category}</span>
                            {l2Categories.length > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                          </Link>
                          
                          {/* L2 Flyout Menu */}
                          {l2Categories.length > 0 && (
                            <div className="absolute left-full top-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block -ml-1">
                              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                {l2Categories.map((l2) => (
                                  <Link
                                    key={l2}
                                    href={`/machine/${slugify(l2)}`}
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                  >
                                    {l2}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 hover:bg-gray-50 rounded-lg"
              >
                Home
              </Link>
              
              {/* Mobile Products Section */}
              <div className="px-4">
                <div className="font-medium text-gray-900 mb-2 px-2">Products</div>
                <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                  <Link
                    href="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    All Products
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/machine/${slugify(category)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 px-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
