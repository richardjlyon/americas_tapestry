import { CategoryFilter } from '@/components/features/news/category-filter';
import { NewsGrid } from '@/components/features/news/news-grid';
import { FeaturedPosts } from '@/components/features/news/featured-posts';
import { getAllBlogPosts, getFeaturedBlogPosts } from '@/lib/blog';
import { PageSection } from '@/components/ui/page-section';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'News',
  description:
    "Updates, events, and historical insights from the America's Tapestry project.",
  path: '/news',
});

export default async function NewsPage() {
  const allPosts = await getAllBlogPosts();
  const featuredPosts = await getFeaturedBlogPosts();

  return (
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-10 pb-4 text-center">
        <span className="eyebrow eyebrow-gold">The Journal</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          News & Updates
        </h1>
        <p className="gallery-lead mx-auto mt-3">
          Stay informed about America's Tapestry with the latest project
          updates, historical insights, and event information.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      {/* Category Filter Section */}
      <PageSection paddingTop="small" paddingBottom="none" background="colonial-oxblood">
        <h2 className="gallery-heading text-center text-xl mb-6">
          Browse by Category
        </h2>
        <CategoryFilter />
      </PageSection>

      {/* Featured Posts Section (if any) */}
      {featuredPosts.length > 0 && (
        <PageSection paddingTop="small" paddingBottom="small" background="colonial-oxblood">
          <FeaturedPosts posts={featuredPosts} />
        </PageSection>
      )}

      {/* All Posts Grid */}
      <PageSection paddingTop="none" background="colonial-oxblood">
        <h2 className="gallery-heading text-center text-2xl mb-6">
          Latest Articles
        </h2>
        <NewsGrid posts={allPosts} />
      </PageSection>
    </div>
  );
}
