import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/lib/blog';
import { blogCategories } from '@/lib/blog';
import { ArrowRight, Play } from 'lucide-react';
import { NavyButton } from '@/components/ui/colonial-buttons';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  // Find the category info
  const category = blogCategories.find((cat) => cat.slug === post.category);
  const isVideo = post.category === 'videos';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-colonial-navy/10">
      <div className="md:flex">
        <div className="md:w-1/2">
          <div className="h-64 md:h-full relative">
            {post.image ? (
              <Image
                src={getImagePath(post.image)}
                alt={post.title}
                fill
                sizes={getImageSizes('feature')}
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-colonial-navy/40 text-center p-4">
                  America&apos;s Tapestry
                </div>
              </div>
            )}
            <div className="absolute top-0 right-0 bg-colonial-burgundy text-colonial-parchment text-sm font-medium px-3 py-1 rounded-bl-lg z-10">
              {category?.name || post.category}
            </div>
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-colonial-navy/70 rounded-full p-4 text-colonial-parchment">
                  <Play className="h-10 w-10" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:w-1/2 p-6 md:p-8">
          <div className="text-sm text-colonial-navy/60 mb-2">
            {formatDate(post.date)} {post.author && `• By ${post.author}`}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy mb-3">
            {post.title}
          </h2>
          <p className="font-serif text-colonial-navy/80 mb-6 line-clamp-4">
            {post.excerpt}
          </p>
          <NavyButton asChild variant="outline" className="text-sm">
            <Link href={`/news/${post.slug}`}>
              {isVideo ? 'Watch Video' : 'Read Full Article'}{' '}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </NavyButton>
        </div>
      </div>
    </div>
  );
}