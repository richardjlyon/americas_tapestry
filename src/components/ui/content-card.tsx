import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContentCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function ContentCard({
  children,
  className,
  padding = 'medium',
}: ContentCardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-4 md:p-6',
    medium: 'p-6 md:p-8',
    large: 'p-8 md:p-10',
  };

  // Extract custom background if it exists in className
  const hasCustomBg = className?.includes('vintage-paper');

  return (
    <div
      className={cn(
        // Only apply bg-white if no custom background is provided
        hasCustomBg ? '' : 'bg-white',
        'rounded-lg shadow-md border border-colonial-navy/10',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
