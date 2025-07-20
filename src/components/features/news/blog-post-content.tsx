import { ReadingContainer } from '@/components/ui/reading-container';
import type { BlogPost } from '@/lib/blog';
import { blogCategories } from '@/lib/blog';
import { MarkdownContent } from './markdown-content';
import { PostMetadata } from './post-metadata';

interface BlogPostContentProps {
  post: BlogPost;
  contentHtml: string;
}

export function BlogPostContent({ post, contentHtml }: BlogPostContentProps) {
  // Find the category info
  const category = blogCategories.find((cat) => cat.slug === post.category);

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
          <MarkdownContent html={contentHtml} />
        </div>

        {/* Video section - only show if videoUrl exists */}
        {post.videoUrl && (
          <video
            className="w-full aspect-video"
            controls
            preload="metadata"
            poster={post.image || '/images/placeholders/placeholder.svg'}
          >
            <source src={post.videoUrl} type="video/mp4" />
            <track kind="captions" src="#" label="English" />
            Your browser does not support the video tag.
          </video>
        )}
      </ReadingContainer>
    </div>
  );
}
