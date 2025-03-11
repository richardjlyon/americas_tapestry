import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { Mail } from 'lucide-react';

export function GetInTouchSection() {
  return (
    <>
      <SectionHeader
        title="Get in Touch"
        description="Interested in learning more about America's Tapestry or discussing exhibition opportunities?"
      />

      <div className="text-center">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full border-colonial-gold text-colonial-gold hover:bg-colonial-gold hover:text-colonial-navy"
        >
          <Link href="/contact">
            <Mail className="mr-2 h-4 w-4" /> Contact Us
          </Link>
        </Button>
      </div>
    </>
  );
}
