import { getAllPosts } from '@/lib/mdx';
import BlogList from '@/components/BlogList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Industry Insights & Case Studies',
  description: 'Read our latest success stories, technical guides, and industry news about coil packing and automation.',
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Industry Insights
          </h1>
          <p className="text-lg text-slate-600">
            Discover how we're transforming industrial packaging with automation.
          </p>
        </div>

        <BlogList posts={posts} />
      </div>
    </div>
  );
}
