import { formatDate } from '@/lib/utils';

interface PostMetadataProps {
  date: string;
  author?: string;
  className?: string;
}

export function PostMetadata({
  date,
  author,
  className = '',
}: PostMetadataProps) {
  return (
    <div className={`text-sm text-colonial-navy/60 ${className}`}>
      {formatDate(date)} {author && `• By ${author}`}
    </div>
  );
}
