import { ReadingContainer } from '@/components/ui/reading-container';
import type { BlogPost } from '@/lib/blog';
import { blogCategories } from '@/lib/blog';
import { MarkdownContent } from './markdown-content';
import { PostGallery } from './post-gallery';
import { PostMetadata } from './post-metadata';

interface BlogPostContentProps {
  post: BlogPost;
  contentHtml: string;
}

// A marker on its own line in the markdown body places a picture set:
// `<!-- gallery -->` for the default `gallery`, `<!-- gallery:name -->` for a
// set from `galleries`. remark-html passes HTML comments through unchanged.
const GALLERY_MARKER = /<!--\s*gallery(?::([A-Za-z0-9_-]+))?\s*-->/;

type Segment =
  | { kind: 'html'; html: string }
  | { kind: 'gallery'; name: string | null };

function splitOnGalleryMarkers(html: string): Segment[] {
  // With one capture group, split() alternates: html, name, html, name, ...
  const parts = html.split(new RegExp(GALLERY_MARKER.source, 'g'));
  const segments: Segment[] = [];
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      if (part && part.trim()) segments.push({ kind: 'html', html: part });
    } else {
      segments.push({ kind: 'gallery', name: part ?? null });
    }
  });
  return segments;
}

export function BlogPostContent({ post, contentHtml }: BlogPostContentProps) {
  // Find the category info
  const category = blogCategories.find((cat) => cat.slug === post.category);

  const segments = splitOnGalleryMarkers(contentHtml);
  const defaultPlaced = segments.some(
    (s) => s.kind === 'gallery' && s.name === null,
  );
  const imagesFor = (name: string | null) =>
    name === null ? post.gallery : post.galleries?.[name];

  return (
    <div className="mt-16">
      <ReadingContainer
        width="content"
        background="paper"
        className="overflow-hidden p-0"
      >
        {/* Category banner */}
        <div className="bg-colonial-navy text-colonial-parchment text-sm font-medium px-4 py-2">
          {category?.name || post.category}
        </div>

        {/* Content section */}
        <div className="p-6 md:p-8">
          <PostMetadata
            date={post.date}
            {...(post.author && { author: post.author })}
            className="mb-3"
          />
          {segments.map((segment, i) => {
            if (segment.kind === 'html') {
              // biome-ignore lint/suspicious/noArrayIndexKey: static, ordered body segments
              return <MarkdownContent key={i} html={segment.html} />;
            }
            const images = imagesFor(segment.name);
            if (!images || images.length === 0) return null;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static, ordered body segments
              <div key={i} className="not-prose my-8">
                <PostGallery images={images} />
              </div>
            );
          })}

          {/* Backward compatible: with no `<!-- gallery -->` marker the
              default gallery renders at the foot, as it always has. */}
          {!defaultPlaced && post.gallery && post.gallery.length > 0 && (
            <div className="mt-8">
              <PostGallery images={post.gallery} />
            </div>
          )}
        </div>

        {/* Video section - only show if videoUrl exists */}
        {post.videoUrl && (
          <div className="flex justify-center bg-black">
            <video
              className="w-full max-h-[70vh] object-contain"
              controls
              preload="metadata"
              poster={post.image || '/images/placeholders/placeholder.svg'}
            >
              {/* WebM first for modern browsers (if available) */}
              {post.videoWebm && (
                <source src={post.videoWebm} type="video/webm" />
              )}
              {/* MP4 fallback for all browsers */}
              <source src={post.videoUrl} type="video/mp4" />
              <track kind="captions" src="#" label="English" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </ReadingContainer>
    </div>
  );
}
