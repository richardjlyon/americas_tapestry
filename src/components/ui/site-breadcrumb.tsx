'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function SiteBreadcrumb() {
  const pathname = usePathname();

  // Skip rendering breadcrumbs on home page and exhibitions
  // Dark Night Gallery routes render without the light breadcrumb bar; a
  // site-wide dark breadcrumb treatment lands in Phase 3d.
  if (
    pathname === '/' ||
    pathname === '/exhibitions' ||
    pathname === '/about' ||
    pathname.startsWith('/tapestries')
  ) {
    return null;
  }

  // Create breadcrumb segments from pathname
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  // Format segment names for display
  const formatSegmentName = (segment: string) => {
    // Handle dynamic route parameters that might show up as actual values
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return segment.slice(1, -1).replace(/-/g, ' ');
    }
    return segment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    // The header is fixed positioned, so we need margin-top to prevent
    // overlap. Navy strip continues the Night Gallery chrome; a faint
    // hairline separates it from the fixed header above.
    <div className="mt-16 w-full border-b border-white/10 bg-colonial-navy/90 py-3 backdrop-blur-sm md:mt-20 md:pb-4">
      <div className="container mx-auto">
        <Breadcrumb>
          <BreadcrumbList className="font-sans text-lg font-medium text-colonial-parchment/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="font-sans text-colonial-parchment/70 hover:text-colonial-gold"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {pathSegments.map((segment, index) => {
              const isLastItem = index === pathSegments.length - 1;
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const label = formatSegmentName(segment);

              return (
                <Fragment key={segment}>
                  <BreadcrumbItem>
                    {isLastItem ? (
                      <BreadcrumbPage className="font-sans font-bold text-colonial-gold">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={href}
                          className="font-sans text-colonial-parchment/70 hover:text-colonial-gold"
                        >
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLastItem && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
