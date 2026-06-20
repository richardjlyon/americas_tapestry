import Link from 'next/link';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Card-styled call-to-action chip linking to a stitcher list page. Matches the
 * member chips in the tapestry team grid (circular icon frame, bold label).
 */
export function StitcherLinkCard({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[300px]"
    >
      <Card className="border border-colonial-parchment/60 overflow-hidden hover:shadow-md transition-shadow h-full">
        <CardContent className="pb-0 mb-0 h-full">
          <div className="flex flex-col items-center p-4 h-full">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-colonial-burgundy flex items-center justify-center bg-colonial-parchment/30">
              <Users className="w-12 h-12 text-colonial-burgundy" aria-hidden="true" />
            </div>
            <div className="text-center w-full flex-grow flex flex-col">
              <div className="flex-grow">
                <h3 className="font-sans text-lg font-bold text-colonial-burgundy">
                  {label}
                </h3>
              </div>
              <div className="mt-auto pt-4">
                <span className="inline-block text-link">View list →</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
