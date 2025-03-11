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
        'pt-12 pb-24',
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
