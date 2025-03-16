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
import { markdownToHtml } from '@/lib/markdown';
import { PageSection } from '@/components/ui/page-section';

export async function generateStaticParams() {
  const posts = getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Function to add captions to images in HTML
function addImageCaptions(htmlContent: string): string {
  // Replace standard markdown image tags with figure + figcaption
  // This regex looks for <p><img src="..." alt="..."></p> tags which is how remark-html typically renders markdown images
  return htmlContent.replace(
    /<p>(<img\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*>)<\/p>/g,
    (match, img, src, alt) => `
      <figure class="image-with-caption">
        ${img}
        <figcaption>${alt}</figcaption>
      </figure>
    `,
  );
}

export default async function BlogPostPage({
  params,
}: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Debug logging
  console.log('Post data:', {
    title: post.title,
    category: post.category,
    videoUrl: post.videoUrl,
    image: post.image,
  });

  // Convert markdown to HTML using our modified function
  let contentHtml = await markdownToHtml(post.content);

  // Add captions to images
  contentHtml = addImageCaptions(contentHtml);

  // Get related posts from the same category
  const relatedPosts = getBlogPostsByCategory(
    post.category as BlogCategory,
  ).filter((p) => p.slug !== post.slug); // Exclude current post

  // Get category info
  const categoryInfo = getCategoryBySlug(post.category);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <PostTitle title={post.title} />
        <PostExcerpt excerpt={post.excerpt} />
      </div>

      {/* Content Section */}
      <PageSection paddingTop="none" paddingBottom="none">
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
