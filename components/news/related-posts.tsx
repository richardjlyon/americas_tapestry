import { BlogCard } from '@/components/blog-card';
import type { BlogPost } from '@/lib/blog';

interface RelatedPostsProps {
  posts: BlogPost[];
  title?: string;
  limit?: number;
}

export function RelatedPosts({
  posts,
  title = 'You May Also Like',
  limit = 3,
}: RelatedPostsProps) {
  if (posts.length === 0) return null;

  // Limit the number of posts to display
  const limitedPosts = posts.slice(0, limit);

  return (
    <div className="mt-12">
      <h2 className="section-title text-center mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {limitedPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
