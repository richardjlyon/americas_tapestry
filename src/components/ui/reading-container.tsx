import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ContentCard } from './content-card';

interface ReadingContainerProps {
  children: ReactNode;
  width?: 'article' | 'content' | 'wide';
  background?: 'paper' | 'parchment' | 'none';
  className?: string;
}

export function ReadingContainer({
  children,
  width = 'content',
  background = 'paper',
  className
}: ReadingContainerProps) {
  const widthClasses = {
    article: 'max-w-3xl',  // ~600-700px, optimal reading width
    content: 'max-w-4xl',  // ~800-900px, mixed content
    wide: 'max-w-5xl'      // ~1000px, visual content
  };

  const backgroundClasses = {
    paper: 'vintage-paper',
    parchment: 'authentic-parchment',
    none: ''
  };

  return (
    <div className={cn('mx-auto', widthClasses[width])}>
      <ContentCard
        className={cn(
          'content-typography',
          backgroundClasses[background],
          className
        )}
        padding="large"
      >
        {children}
      </ContentCard>
    </div>
  );
}