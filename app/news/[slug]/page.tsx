import { BlogPostContent } from '@/components/news/blog-post-content';
import { RelatedPosts } from '@/components/news/related-posts';
import { PostNavigation } from '@/components/news/post-navigation';
import { PostExcerpt } from '@/components/news/post-excerpt';
import { PostTitle } from '@/components/news/post-title';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostsByCategory,
  getCategoryBySlug,
} from '@/lib/blog';
import type { BlogCategory } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';
import { PageSection } from '@/components/ui/page-section';

export async function generateStaticParams() {
  const posts = getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();

  // Get related posts from the same category
  const relatedPosts = getBlogPostsByCategory(
    post.category as BlogCategory,
  ).filter((p) => p.slug !== post.slug); // Exclude current post

  // Get category info
  const categoryInfo = getCategoryBySlug(post.category);

  return (
    <>
      {/* Page Header */}
      <PostTitle title={post.title} />
      <PostExcerpt excerpt={post.excerpt} />

      {/* Navigation Section */}
      <PageSection background="colonial-parchment">
        <PostNavigation
          categoryInfo={categoryInfo}
          categorySlug={post.category}
        />
      </PageSection>

      {/* Content Section */}
      <PageSection background="vintage-paper">
        <BlogPostContent post={post} contentHtml={contentHtml} />
      </PageSection>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <PageSection background="colonial-parchment">
          <RelatedPosts
            posts={relatedPosts}
            title={`More ${post.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`}
          />
        </PageSection>
      )}
    </>
  );
}
