import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Play } from 'lucide-react';
import type { BlogPost } from '@/lib/blog';
import { blogCategories } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  // Find the category info
  const category = blogCategories.find((cat) => cat.slug === post.category);
  const isVideo = post.category === 'videos';

  return (
    <div
      className={`vintage-paper rounded-lg shadow-md overflow-hidden border border-colonial-navy/10 h-full flex flex-col ${className}`}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        {/* image */}
        <img
          src={
            post.image ||
            "/placeholder.svg?height=450&width=800&text=America's+Tapestry"
          }
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* content */}
        <div className="absolute top-0 right-0 text-colonial-parchment text-xs font-medium px-3 py-1 rounded-bl-lg">
          {category?.name || post.category}
        </div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-colonial-navy/70 rounded-full p-3 text-colonial-parchment">
              <Play className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        {/* date and author */}
        <div className="text-sm text-colonial-navy/60 mb-2">
          {formatDate(post.date)} {post.author && `• By ${post.author}`}
        </div>

        {/* title */}
        <h3 className="text-xl font-bold text-colonial-navy mb-2">
          {post.title}
        </h3>

        {/* excerpt */}
        <p className="font-serif text-colonial-navy/80 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* read more */}
        <div className="mt-auto pt-2">
          <Link
            href={`/news/${post.slug}`}
            className="inline-block text-colonial-burgundy hover:text-colonial-navy font-medium transition-colors"
          >
            {isVideo ? 'Watch video →' : 'Read more →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
