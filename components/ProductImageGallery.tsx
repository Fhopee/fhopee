'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
  productName: string;
  mainImage: string;
  gallery: string[];
}

export default function ProductImageGallery({ 
  productName, 
  mainImage, 
  gallery 
}: ProductImageGalleryProps) {
  // Combine main image with gallery images
  const allImages = [mainImage, ...gallery];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative w-full aspect-[4/3] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 group">
        <Image
          src={allImages[selectedImageIndex]}
          alt={`${productName} - View ${selectedImageIndex + 1}`}
          fill
          unoptimized
          className="object-contain object-center p-8 transition-transform duration-300 group-hover:scale-105"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        
        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </div>

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedImageIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square bg-white rounded-lg shadow-sm overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === index
                  ? 'border-blue-600 ring-2 ring-blue-200 scale-105'
                  : 'border-gray-200 hover:border-blue-400 hover:scale-105'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                unoptimized
                className="object-cover p-2"
                sizes="(max-width: 1024px) 25vw, 12vw"
              />
              
              {/* Active indicator */}
              {selectedImageIndex === index && (
                <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Navigation hint for mobile */}
      {allImages.length > 1 && (
        <p className="text-center text-sm text-gray-500 md:hidden">
          Tap thumbnails to view different images
        </p>
      )}
    </div>
  );
}

