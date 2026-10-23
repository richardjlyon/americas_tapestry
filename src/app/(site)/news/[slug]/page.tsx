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
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found | America's Tapestry" };
  }

  return pageMetadata({
    title: post.title,
    description:
      post.excerpt || `${post.title} — an update from America's Tapestry.`,
    path: `/news/${slug}`,
    image: post.image || undefined,
  });
}

// Longest italic paragraph (in text characters) still treated as a caption.
// Longer italic paragraphs (e.g. a quoted testimonial) stay in the body.
const MAX_CAPTION_LENGTH = 200;

// Function to add captions to images in HTML
function addImageCaptions(htmlContent: string): string {
  // Replace standard markdown image tags with figure + figcaption.
  // remark-html renders a markdown image as <p><img src="..." alt="..."></p>.
  // Caption source, in order:
  //   1. an italic-only paragraph directly after the image (`*Caption*`):
  //      it becomes the figcaption and the separate paragraph is dropped,
  //      so the alt text can describe the image without being shown twice;
  //   2. otherwise the alt text (older posts use alt as their caption).
  return htmlContent.replace(
    /<p>(<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>)<\/p>(?:(\s*)<p><em>((?:(?!<\/p>)[\s\S])*?)<\/em><\/p>)?/g,
    (match, img, _src, alt, _gap, italic) => {
      const italicText =
        italic === undefined ? '' : italic.replace(/<[^>]+>/g, '').trim();
      // Italic-only means one <em> run for the whole paragraph, not
      // "<em>a</em> and <em>b</em>". A line with a link is a call to
      // action ("Click here"), not a caption.
      const useItalic =
        italic !== undefined &&
        !italic.includes('</em>') &&
        !italic.includes('<a ') &&
        italicText.length > 0 &&
        italicText.length <= MAX_CAPTION_LENGTH;
      if (italic !== undefined && !useItalic) {
        // Not a caption: caption from alt as before, keep the paragraph.
        const imgPart = match.slice(0, match.indexOf('</p>') + 4);
        return addImageCaptions(imgPart) + match.slice(imgPart.length);
      }
      const caption = useItalic
        ? `<figcaption>${italic}</figcaption>`
        : alt
          ? `<figcaption>${alt}</figcaption>`
          : '';
      return `
        <figure class="image-with-caption">
          ${img}
          ${caption}
        </figure>
      `;
    },
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
