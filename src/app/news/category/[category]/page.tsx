import { NewsGrid } from '@/components/features/news/news-grid';
import { CategoryPageFilter } from '@/components/features/news/category-page-filter';
import {
  getBlogPostsByCategory,
  getCategoryBySlug,
  blogCategories,
} from '@/lib/blog';
import type { BlogCategory } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';

export async function generateStaticParams() {
  return blogCategories.map((category) => ({
    category: category.slug,
  }));
}

export default async function CategoryPage({
  params,
}: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryInfo = getCategoryBySlug(category);

  if (!categoryInfo) {
    notFound();
  }

  const posts = await getBlogPostsByCategory(category as BlogCategory);

  return (
    <>
      {/* Header Section */}
      <h1 className="page-heading">{categoryInfo.name}</h1>

      <div className="lead-text text-center">{categoryInfo.description}</div>

      {/* Category Filter */}
      <PageSection paddingTop="small" paddingBottom="none">
        <h2 className="section-title text-center mb-6 text-xl">
          Browse Categories
        </h2>
        <CategoryPageFilter currentCategory={category} />
      </PageSection>

      {/* Blog Posts Grid */}
      <PageSection background="colonial-parchment">
        <h2 className="section-title text-center mb-6">
          {categoryInfo.name} Articles
        </h2>
        <NewsGrid posts={posts} />
      </PageSection>
    </>
  );
}
