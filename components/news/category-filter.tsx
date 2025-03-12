import Link from 'next/link';
import { blogCategories } from '@/lib/blog';

export function CategoryFilter() {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      <Link
        href="/news"
        className="inline-block px-4 py-2 rounded-full bg-colonial-navy text-colonial-parchment text-sm font-medium"
      >
        All Categories
      </Link>
      {blogCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/news/category/${category.slug}`}
          className="inline-block px-4 py-2 rounded-full bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy text-sm font-medium hover:bg-colonial-navy/10 transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
