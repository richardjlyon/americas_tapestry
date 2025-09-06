import Link from 'next/link';
import { SectionHeader } from '@/components/ui/section-header';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          variant="colonial-primary"
          className="text-base py-2 px-5"
        >
          <Link href="/contact">
            <Mail className="mr-2 h-4 w-4" /> Contact Us
          </Link>
        </Button>
      </div>
    </>
  );
}
