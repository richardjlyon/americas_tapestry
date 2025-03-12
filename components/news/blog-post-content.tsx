import { ContentCard } from '@/components/ui/content-card';
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
    <ContentCard className="overflow-hidden p-0 max-w-4xl mx-auto vintage-paper">
      {post.image && (
        <div className="aspect-[16/9] relative ">
          <img
            src={post.image || '/placeholder.svg'}
            alt={post.title}
            className="w-full h-full object-cover drop-shadow-md"
          />
          <div className="absolute top-0 right-0 text-colonial-parchment text-sm font-medium px-4 py-2 rounded-bl-lg">
            {category?.name || post.category}
          </div>
        </div>
      )}

      <div className="content-typography p-6 md:p-8">
        <PostMetadata date={post.date} author={post.author} className="mb-3" />
        <MarkdownContent html={contentHtml} />
      </div>
    </ContentCard>
  );
}
