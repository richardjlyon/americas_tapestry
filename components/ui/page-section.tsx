import type { ReactNode } from 'react';
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
  hasPin?: boolean;
  spacing?: 'none' | 'small' | 'medium' | 'large' | 'default';
  paddingTop?: 'none' | 'small' | 'medium' | 'large' | 'default';
  paddingBottom?: 'none' | 'small' | 'medium' | 'large' | 'default';
}

export function PageSection({
  children,
  background = 'woven-linen',
  container = true,
  className,
  hasPin = true,
  spacing = 'default',
  paddingTop = 'none',
  paddingBottom = 'small',
}: PageSectionProps) {
  // Determine padding classes based on spacing props
  const getPaddingClass = () => {
    // If individual padding props are provided, they take precedence
    const topPadding = paddingTop ? paddingTop : spacing;
    const bottomPadding = paddingBottom ? paddingBottom : spacing;

    const topClass = {
      none: 'pt-0',
      small: 'pt-6 md:pt-8',
      medium: 'pt-8 md:pt-12',
      large: 'pt-12 md:pt-16',
      default: 'pt-12 md:pt-16 lg:pt-20',
    }[topPadding];

    const bottomClass = {
      none: 'pb-0',
      small: 'pb-6 md:pb-8',
      medium: 'pb-8 md:pb-12',
      large: 'pb-12 md:pb-16',
      default: 'pb-12 md:pb-16 lg:pb-20',
    }[bottomPadding];

    return `${topClass} ${bottomClass}`;
  };

  return (
    <section
      className={cn(
        'page-section',
        hasPin && 'page-section-pin',
        getPaddingClass(),
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
