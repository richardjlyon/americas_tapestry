import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  href: string;
  label: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <div className="mb-6">
      <Button
        asChild
        variant="ghost"
        className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
      >
        <Link href={href}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
    </div>
  );
}
