import Link from 'next/link';
import { SectionHeader } from '@/components/ui/section-header';
import { Mail } from 'lucide-react';
import { ColonialGoldButton } from '@/components/ui/colonial-buttons';

export function GetInTouchSection() {
  return (
    <>
      <SectionHeader
        title="Get in Touch"
        description="Interested in learning more about America's Tapestry or discussing exhibition opportunities?"
      />

      <div className="text-center">
        <ColonialGoldButton
          asChild
          variant="outline"
          className="px-6 py-2.5 text-base"
        >
          <Link href="/contact">
            <Mail className="mr-2 h-4 w-4" /> Contact Us
          </Link>
        </ColonialGoldButton>
      </div>
    </>
  );
}
