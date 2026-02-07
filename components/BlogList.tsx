"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { Post } from '@/lib/mdx';

type BlogListProps = {
  posts: Post[];
};

export default function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const allCategories = posts
      .map(post => post.meta.category)
      .filter((category): category is string => !!category);
    
    // Use Set to remove duplicates and sort
    return ['All', ...Array.from(new Set(allCategories)).sort()];
  }, [posts]);

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') {
      return posts;
    }
    return posts.filter(post => post.meta.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-blue-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full"
          >
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {post.meta.date}
                </div>
                {post.meta.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <Tag className="w-3 h-3 mr-1" />
                    {post.meta.category}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.meta.title}
              </h2>
              
              <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">
                {post.meta.description}
              </p>
              
              <div className="flex items-center text-blue-600 font-medium text-sm mt-auto pt-4 border-t border-slate-100">
                Read Article
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}

