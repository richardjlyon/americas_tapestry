import { BlogCard } from '@/components/blog-card';
import { ContentCard } from '@/components/ui/content-card';
import type { BlogPost } from '@/lib/blog';

interface NewsGridProps {
  posts: BlogPost[];
}

export function NewsGrid({ posts }: NewsGridProps) {
  const hasPosts = posts.length > 0;

  return (
    <>
      {hasPosts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <ContentCard className="text-center max-w-2xl mx-auto">
          <p className="font-serif text-colonial-navy/80 text-lg mb-4">
            No blog posts have been published yet. Check back soon for updates
            on America's Tapestry project.
          </p>
          <p className="font-serif text-colonial-navy/60 text-base">
            Our team is working on creating engaging content about our tapestry
            panels, historical insights, and upcoming events.
          </p>
        </ContentCard>
      )}
    </>
  );
}
