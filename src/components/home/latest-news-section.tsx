import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { BlogCard } from '@/components/blog-card';
import { FeaturedPost } from '@/components/featured-post';
import { getFeaturedBlogPosts, getLatestBlogPosts } from '@/lib/blog';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';
import { NavyButton } from '@/components/ui/colonial-buttons';

export function LatestNewsSection() {
  const featuredPosts = getFeaturedBlogPosts() || [];
  const latestPosts = getLatestBlogPosts(3) || [];

  // Get the first featured post, if any
  const featuredPost = featuredPosts.length > 0 ? featuredPosts[0] : null;

  // Filter out the featured post from latest posts to avoid duplication
  const filteredLatestPosts = featuredPost
    ? latestPosts.filter((post) => post.slug !== featuredPost.slug)
    : latestPosts;

  // Take only the posts we need
  const displayPosts = filteredLatestPosts.slice(0, featuredPost ? 2 : 3);

  // Check if we have any posts to display
  const hasPostsToDisplay = featuredPost || displayPosts.length > 0;

  return (
    <>
      <SectionHeader
        title="Latest News"
        description="Stay updated with the latest developments, events, and insights from America's Tapestry"
      />

      {hasPostsToDisplay ? (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-10">
              <FeaturedPost post={featuredPost} />
            </div>
          )}

          {/* Latest Posts Grid */}
          {displayPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </>
      ) : (
        <ContentCard className="text-center">
          <p className="font-serif text-colonial-navy/80 text-lg mb-4">
            News articles coming soon! Check back for updates on America's
            Tapestry project.
          </p>
        </ContentCard>
      )}

      <div className="text-center mt-10 md:mt-12">
        <NavyButton
          asChild
          variant="outline"
          className="px-6 py-2.5 text-base"
        >
          <Link href="/news">
            View All News <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </NavyButton>
      </div>
    </>
  );
}
