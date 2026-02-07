import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import InteractiveLayout from '@/components/InteractiveLayout';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import type { Metadata } from 'next';

// Define components available in MDX files
const components = {
  InteractiveLayout,
};

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.meta.title} | Fhopee Blog`,
    description: post.meta.description,
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {post.meta.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {post.meta.date}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {post.meta.author}
            </div>
          </div>

          {post.meta.tags && (
            <div className="flex flex-wrap gap-2">
              {post.meta.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl">
          <MDXRemote source={post.content} components={components} />
        </div>
      </article>
    </div>
  );
}

