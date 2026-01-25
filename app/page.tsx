import Link from 'next/link';
import { 
  ArrowRight, 
  Package, 
  Layers, 
  Settings, 
  Factory, 
  Wrench, 
  Globe, 
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { getAllProducts } from '@/lib/products';
import { getL1Categories } from '@/lib/category-config';
import ContactButton from '@/components/ContactButton';
import ProductCard from '@/components/ProductCard';

export default async function HomePage() {
  // Fetch data
  const allProducts = getAllProducts();
  const featuredProducts = allProducts.slice(0, 4);
  const l1Categories = getL1Categories();

  // Category icons mapping (customize based on your categories)
  const categoryIcons: Record<string, any> = {
    "Horizontal Orbital Stretch Wrapper": Package,
    "Stretch Wrapping Machine": Layers,
    "Automatic Strapping Machine": Settings,
    "Shrink Wrap Machine": Package,
    "Coil Packing Machine": Factory,
    "Automatic Packing Line": TrendingUp,
    "Pallet Inverter & Changer": Settings,
    "Automatic Coiler": Factory,
    "Upender & Tilter": Settings,
    "Auto Bagging Machine": Package,
  };

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-semibold text-blue-200">Industry-Leading Technology</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Advanced Coil Packing &<br />
              <span className="text-blue-400">Automation Solutions</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              Engineered for efficiency, safety, and reliability.<br />
              Transform your production line with industrial-grade machinery.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-200 group"
              >
                View Catalog
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <ContactButton className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-white/30 hover:border-white/50 transition-all duration-200">
                Contact Us
              </ContactButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">500+</div>
                <div className="text-sm text-gray-400">Machine Models</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">50+</div>
                <div className="text-sm text-gray-400">Countries Served</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">24/7</div>
                <div className="text-sm text-gray-400">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M0,0 L0,60 Q300,120 600,60 T1200,60 L1200,0 Z"></path>
          </svg>
        </div>
      </section>

      {/* Key Categories Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive industrial machinery for every stage of your production line.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {l1Categories.slice(0, 9).map((category) => {
              const IconComponent = categoryIcons[category] || Package;
              
              return (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {category}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        Professional {category.toLowerCase()} solutions for industrial applications.
                      </p>
                      <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                        Explore
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Partner with industry experts committed to your success.
            </p>
          </div>

          {/* 3-Column Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Factory Direct */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mb-6">
                <Factory className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Factory Direct</h3>
              <p className="text-gray-600 leading-relaxed">
                Skip the middleman. Get premium machinery at competitive prices with direct manufacturer support and warranties.
              </p>
            </div>

            {/* Custom Engineering */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mb-6">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Engineering</h3>
              <p className="text-gray-600 leading-relaxed">
                Unique production needs? Our engineers design tailored automation solutions to match your exact specifications.
              </p>
            </div>

            {/* Global Support */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mb-6">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Support</h3>
              <p className="text-gray-600 leading-relaxed">
                24/7 technical support, worldwide spare parts delivery, and local service partners in 50+ countries.
              </p>
            </div>
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-bold text-gray-900">ISO Certified</div>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-bold text-gray-900">CE Compliant</div>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-bold text-gray-900">Fast ROI</div>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-bold text-gray-900">Easy Maintenance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Latest Machinery
              </h2>
              <p className="text-lg text-gray-600">
                Discover our newest industrial automation solutions.
              </p>
            </div>
            
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-200"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Products Grid */}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Need a Custom Solution?
              </h2>
              <p className="text-xl text-blue-100">
                Let our engineers design the perfect automation system for your production line.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              <ContactButton className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center gap-2 group">
                Contact Engineers
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </ContactButton>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}






