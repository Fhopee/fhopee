'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

interface ProductVideoSectionProps {
  youtubeId: string;
  title?: string;
  description?: string;
  thumbnailImage?: string; // 可选的主图作为封面
}

export default function ProductVideoSection({ 
  youtubeId, 
  title = "Product Video", 
  description,
  thumbnailImage
}: ProductVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // 清理并验证 youtubeId
  const cleanYoutubeId = youtubeId?.trim();
  if (!cleanYoutubeId) {
    return null;
  }

  // 优先使用主图，如果没有则使用 YouTube 缩略图
  const thumbnailSrc = thumbnailImage || `https://img.youtube.com/vi/${cleanYoutubeId}/maxresdefault.jpg`;
  // 如果使用主图，失败时回退到 YouTube 缩略图；如果直接使用 YouTube 缩略图，失败时回退到 hqdefault
  const fallbackSrc = thumbnailImage 
    ? `https://img.youtube.com/vi/${cleanYoutubeId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`;

  return (
    <div className="my-12 bg-white rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        {/* Video Column (Left) */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md group">
            {!isPlaying ? (
              <button 
                onClick={() => setIsPlaying(true)}
                className="w-full h-full flex items-center justify-center relative cursor-pointer group"
                aria-label="Play video"
              >
                <Image
                  src={thumbnailSrc}
                  alt="Video thumbnail"
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    // 如果主图加载失败，回退到 YouTube 缩略图
                    // 如果 YouTube maxresdefault 失败，回退到 hqdefault
                    const target = e.target as HTMLImageElement;
                    if (target.src !== fallbackSrc) {
                      target.src = fallbackSrc;
                    } else if (!thumbnailImage && target.src.includes('maxresdefault')) {
                      // 如果已经是 maxresdefault 且失败，尝试 hqdefault
                      target.src = `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                  <Play className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" />
                </div>
              </button>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${cleanYoutubeId}?autoplay=1&rel=0`}
                title="Product Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </div>

        {/* Text Column (Right) */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
          </div>
          
          <div className="prose prose-lg text-gray-700">
            {description ? (
              <p>{description}</p>
            ) : (
              <p className="text-gray-500 italic">
                Watch our product demonstration to see the machine in action. 
                Discover how it can improve your production efficiency and packaging quality.
              </p>
            )}
            {/* Placeholder for LLM generated content */}
            <div id="ai-generated-video-description" className="hidden">
              {/* Content will be injected here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

