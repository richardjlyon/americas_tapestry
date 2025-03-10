import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog-card';
import {
  getBlogPostsByCategory,
  getCategoryBySlug,
  blogCategories,
} from '@/lib/blog';
import { notFound } from 'next/navigation';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';

export async function generateStaticParams() {
  return blogCategories.map((category) => ({
    category: category.slug,
  }));
}

export default function CategoryPage({
  params,
}: { params: { category: string } }) {
  const categoryInfo = getCategoryBySlug(params.category);

  if (!categoryInfo) {
    notFound();
  }

  const posts = getBlogPostsByCategory(params.category);
  const hasPosts = posts.length > 0;

  return (
    <PageSection background="colonial-parchment">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
        >
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All News
          </Link>
        </Button>
      </div>

      <h1 className="page-heading">{categoryInfo.name}</h1>

      <p className="lead-text">{categoryInfo.description}</p>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <Link
          href="/news"
          className="inline-block px-4 py-2 rounded-full bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy text-sm font-medium hover:bg-colonial-navy/10 transition-colors"
        >
          All Categories
        </Link>
        {blogCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/news/category/${category.slug}`}
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              category.slug === params.category
                ? 'bg-colonial-navy text-colonial-parchment'
                : 'bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy hover:bg-colonial-navy/10'
            } transition-colors`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* Blog Posts Grid */}
      {hasPosts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <ContentCard className="text-center max-w-2xl mx-auto">
          <p className="font-serif text-colonial-navy/80 text-lg mb-4">
            No posts found in the {categoryInfo.name} category.
          </p>
          <p className="font-serif text-colonial-navy/60 text-base">
            Check back soon for updates or explore other categories.
          </p>
        </ContentCard>
      )}
    </PageSection>
  );
}
