import Link from 'next/link';
import { blogCategories } from '@/lib/blog';

interface CategoryPageFilterProps {
  currentCategory: string;
}

export function CategoryPageFilter({
  currentCategory,
}: CategoryPageFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      <Link
        href="/news"
        className="inline-block px-4 py-2 rounded-full bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy text-sm font-medium hover:bg-colonial-navy/10 transition-colors"
      >
        All Categories
      </Link>
      {blogCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/news/category/${category.slug}`}
          className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            category.slug === currentCategory
              ? 'bg-colonial-navy text-colonial-parchment'
              : 'bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy hover:bg-colonial-navy/10'
          } transition-colors`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
