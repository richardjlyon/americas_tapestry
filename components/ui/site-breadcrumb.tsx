'use client';

import React from 'react';
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

  console.log('Breadcrumb pathname:', pathname);

  // Skip rendering breadcrumbs on home page
  if (pathname === '/') {
    console.log('Skipping breadcrumb on home page');
    return null;
  }

  // Create breadcrumb segments from pathname
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');
  console.log('Breadcrumb segments:', pathSegments);

  // Format segment names for display
  const formatSegmentName = (segment: string) => {
    // Handle dynamic route parameters that might show up as actual values
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return segment.slice(1, -1).replace(/-/g, ' ');
    }
    return segment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    // The header is fixed positioned, so we need margin-top to prevent overlap
    <div className="w-full py-3 mt-16 md:mt-20 woven-linen">
      <div className="container mx-auto">
        <Breadcrumb>
          <BreadcrumbList className="text-colonial-navy font-medium">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-colonial-burgundy hover:text-colonial-burgundy/80"
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
                <React.Fragment key={segment}>
                  <BreadcrumbItem>
                    {isLastItem ? (
                      <BreadcrumbPage className="font-bold">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={href}
                          className="text-colonial-burgundy hover:text-colonial-burgundy/80"
                        >
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLastItem && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
