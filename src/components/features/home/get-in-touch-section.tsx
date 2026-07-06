import Link from 'next/link';
import { SectionHeader } from '@/components/ui/section-header';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GetInTouchSection() {
  return (
    <>
      <SectionHeader
        tone="dark"
        title="Get in Touch"
        description="Questions about visiting, group and school visits, or press enquiries? We'd love to hear from you."
      />

      <div className="text-center">
        <Button
          asChild
          variant="colonial-gold"
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
