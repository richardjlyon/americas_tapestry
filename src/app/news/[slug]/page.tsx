import { BlogPostContent } from '@/components/features/news/blog-post-content';
import { RelatedPosts } from '@/components/features/news/related-posts';
import { PostExcerpt } from '@/components/features/news/post-excerpt';
import { PostTitle } from '@/components/features/news/post-title';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostsByCategory,
} from '@/lib/blog';
import type { BlogCategory } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { markdownToHtml } from '@/lib/markdown';
import { PageSection } from '@/components/ui/page-section';

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Function to add captions to images in HTML
function addImageCaptions(htmlContent: string): string {
  // Replace standard markdown image tags with figure + figcaption
  // This regex looks for <p><img src="..." alt="..."></p> tags which is how remark-html typically renders markdown images
  return htmlContent.replace(
    /<p>(<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>)<\/p>/g,
    (_match, img, _src, alt) => {
      // Only add figcaption if alt text exists
      const caption = alt ? `<figcaption>${alt}</figcaption>` : '';
      return `
        <figure class="image-with-caption">
          ${img}
          ${caption}
        </figure>
      `;
    }
  );
}

export default async function BlogPostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }


  // Convert markdown to HTML using our modified function
  let contentHtml = await markdownToHtml(post.content);

  // Add captions to images
  contentHtml = addImageCaptions(contentHtml);
  
  // Fix redundant image paths in the HTML content
  contentHtml = contentHtml
    .replace(/src="\/images\/news\/images\//g, 'src="/images/news/')
    .replace(/src="\/images\/images\//g, 'src="/images/');

  // Get related posts from the same category
  const relatedPostsAll = await getBlogPostsByCategory(
    post.category as BlogCategory,
  );
  const relatedPosts = relatedPostsAll.filter((p) => p.slug !== post.slug); // Exclude current post

  // Category info would be used for metadata if needed
  // const categoryInfo = getCategoryBySlug(post.category);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <PostTitle title={post.title} />
        <PostExcerpt excerpt={post.excerpt} />
      </div>

      {/* Content Section */}
      <PageSection spacing="normal">
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
