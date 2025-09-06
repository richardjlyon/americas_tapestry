import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageSectionProps {
  children: ReactNode;
  id?: string;
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
  pinPosition?: 'top' | 'bottom';
  // New simplified spacing system
  spacing?: 'tight' | 'normal' | 'spacious';
  // Deprecated - maintained for backward compatibility
  /** @deprecated Use spacing prop instead */
  paddingTop?: 'none' | 'small' | 'medium' | 'large' | 'default';
  /** @deprecated Use spacing prop instead */
  paddingBottom?: 'none' | 'small' | 'medium' | 'large' | 'default';
}

export function PageSection({
  children,
  id = '',
  background = 'woven-linen',
  container = true,
  className,
  hasPin = false,
  pinPosition = 'top',
  spacing = 'normal',
  paddingTop,
  paddingBottom,
}: PageSectionProps) {
  // Determine padding classes based on spacing props
  const getPaddingClass = () => {
    // If deprecated padding props are provided, use backward compatibility
    if (paddingTop || paddingBottom) {
      const topPadding = paddingTop || 'large';
      const bottomPadding = paddingBottom || 'large';

      const topClass = {
        none: 'pt-0',
        small: 'pt-3 md:pt-8',
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
    }

    // Use new simplified spacing system
    const spacingClasses = {
      tight: 'py-8 md:py-12', // For closely related content
      normal: 'py-12 md:py-16', // Default for most content (equivalent to old 'large')
      spacious: 'py-16 md:py-24', // For major section breaks (equivalent to old 'default')
    };

    return spacingClasses[spacing];
  };

  const sectionContent = container ? (
    <div className="container mx-auto">{children}</div>
  ) : (
    children
  );

  return (
    <section
      {...(id && { id })}
      className={cn(
        'page-section',
        hasPin && pinPosition === 'top' && 'page-section-pin',
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
      {sectionContent}
      {hasPin && pinPosition === 'bottom' && (
        <div className="flex justify-center pt-4 pb-2">
          <div className="page-section-pin-bottom" />
        </div>
      )}
    </section>
  );
}
