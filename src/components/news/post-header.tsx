import { BackButton } from './back-button';
import type { BlogPost } from '@/lib/blog';

interface PostHeaderProps {
  post: BlogPost;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <div className="mb-8">
      <BackButton href="/news" label="Back to News" />

      <div className="text-center">
        <h1 className="page-heading">{post.title}</h1>
        {post.excerpt && (
          <p className="lead-text text-center mt-4 max-w-3xl mx-auto">
            {post.excerpt}
          </p>
        )}
      </div>
    </div>
  );
}
