import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // 提取 specifications 的前 3 个键值对
  const specsEntries = Object.entries(product.specifications).slice(0, 3);

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative border border-gray-100/50"
    >
      
      {product.isNew && (
        <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          NEW ARRIVAL
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <Image
          src={product.mainImage}
          alt={product.productName}
          fill
          unoptimized
          className="object-cover object-center mix-blend-multiply opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
            {product.categoryName}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
          {product.productName}
        </h3>

        <div className="mb-6 flex-grow space-y-2">
          {specsEntries.map(([key, value]) => {
            // Convert value to string if it's an object
            let displayValue: string;
            if (typeof value === 'object' && value !== null) {
              // Convert object to string representation
              displayValue = Object.keys(value).join(', ');
            } else if (typeof value === 'string' || typeof value === 'number') {
              // Render strings and numbers normally
              displayValue = String(value);
            } else {
              // Fallback for other types (null, undefined, etc.)
              displayValue = String(value ?? '');
            }

            return (
              <div key={key} className="flex items-center text-sm border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                <span className="w-4 h-4 mr-2 text-blue-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                </span>
                <span className="text-gray-500 w-24 font-medium truncate">{key}</span>
                <span className="text-gray-900 font-semibold truncate">{displayValue}</span>
              </div>
            );
          })}
        </div>

        <div 
          className="w-full py-3 px-4 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 group-hover/btn"
        >
          View Specs
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

