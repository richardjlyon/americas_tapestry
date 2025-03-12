import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CategoryInfo } from '@/lib/blog';

interface PostNavigationProps {
  categoryInfo?: CategoryInfo | undefined;
  categorySlug: string;
}

export function PostNavigation({
  categoryInfo,
  categorySlug,
}: PostNavigationProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        asChild
        variant="ghost"
        className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
      >
        <Link href="/news">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to News
        </Link>
      </Button>

      {categoryInfo && (
        <Link
          href={`/news/category/${categorySlug}`}
          className="inline-block px-4 py-2 rounded-full bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy text-sm font-medium hover:bg-colonial-navy/10 transition-colors"
        >
          {categoryInfo.name}
        </Link>
      )}
    </div>
  );
}
