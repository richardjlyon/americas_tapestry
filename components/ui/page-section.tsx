import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageSectionProps {
  children: ReactNode;
  background?:
    | 'linen-texture'
    | 'woven-linen'
    | 'vintage-paper'
    | 'authentic-parchment'
    | 'colonial-navy'
    | 'colonial-burgundy'
    | 'white'
    | string;
  container?: boolean;
  className?: string;
}

export function PageSection({
  children,
  background = 'woven-linen',
  container = true,
  className,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        'pb-6 md:pt-4 md:pb-12 border-t border-colonial-navy/10',
        {
          'linen-texture': background === 'linen-texture',
          'woven-linen': background === 'woven-linen',
          'vintage-paper': background === 'vintage-paper',
          'authentic-parchment': background === 'authentic-parchment',
          'bg-colonial-navy': background === 'colonial-navy',
          'bg-colonial-burgundy': background === 'colonial-burgundy',
          white: background === 'white' || !background,
        },
        className,
      )}
    >
      {container ? (
        <div className="container mx-auto">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
