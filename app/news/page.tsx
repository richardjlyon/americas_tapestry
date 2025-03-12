import Link from 'next/link';
import { BlogCard } from '@/components/blog-card';
import { CategoryFilter } from '@/components/news/category-filter';
import { NewsGrid } from '@/components/news/news-grid';
import { FeaturedPosts } from '@/components/news/featured-posts';
import {
  getAllBlogPosts,
  getFeaturedBlogPosts,
  blogCategories,
} from '@/lib/blog';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';

export default function NewsPage() {
  const allPosts = getAllBlogPosts();
  const featuredPosts = getFeaturedBlogPosts();

  return (
    <>
      <h1 className="page-heading">News & Updates</h1>

      <div className="lead-text text-center">
        Stay informed about America's Tapestry with the latest project updates,
        historical insights, and event information.
      </div>

      {/* Featured Posts Section (if any) */}
      {featuredPosts.length > 0 && (
        <PageSection background="vintage-paper">
          <FeaturedPosts posts={featuredPosts} />
        </PageSection>
      )}

      {/* Category Filter Section */}
      <PageSection background="colonial-parchment">
        <h2 className="section-title text-center mb-6">Browse by Category</h2>
        <CategoryFilter />
      </PageSection>

      {/* All Posts Grid */}
      <PageSection background="vintage-paper">
        <h2 className="section-title text-center mb-6">Latest Articles</h2>
        <NewsGrid posts={allPosts} />
      </PageSection>
    </>
  );
}
