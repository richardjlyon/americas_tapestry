import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageSectionProps {
  children: ReactNode;
  background?:
    | 'colonial-parchment'
    | 'colonial-stone'
    | 'colonial-navy'
    | 'white'
    | string;
  container?: boolean;
  className?: string;
}

export function PageSection({
  children,
  background = 'white',
  container = true,
  className,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        'py-12 md:py-16',
        background && background !== 'white' && `bg-${background}`,
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
