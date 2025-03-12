interface PostExcerptProps {
  excerpt: string;
}

export function PostExcerpt({ excerpt }: PostExcerptProps) {
  if (!excerpt) return null;

  return (
    <div className="lead-text text-center max-w-3xl mx-auto">{excerpt}</div>
  );
}
