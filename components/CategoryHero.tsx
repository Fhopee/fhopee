import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface CategoryHeroProps {
  title: string;
  description: string;
  imageSrc: string;
  parentCategory?: string | null;
}

export default function CategoryHero({ 
  title, 
  description, 
  imageSrc,
  parentCategory 
}: CategoryHeroProps) {
  return (
    <div className="relative w-full h-[350px] md:h-[450px] flex items-center overflow-hidden group">
      {/* 1. 背景图片 */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={`${title} - Industrial Packaging Machinery Category`}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          priority
        />
        {/* 2. 渐变遮罩：保证文字清晰度 */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
      </div>

      {/* 3. 内容区域 */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* 面包屑导航 (融入 Hero) */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link href="/products" className="hover:text-white transition-colors">
              Products
            </Link>
            
            {parentCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-blue-100">{parentCategory}</span>
              </>
            )}
            
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-white border-b border-blue-500 pb-0.5">
              {title}
            </span>
          </nav>

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            {title}
          </h1>

          {/* 描述 */}
          <p className="text-lg text-slate-200 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}




