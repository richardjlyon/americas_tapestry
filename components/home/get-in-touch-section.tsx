import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export function GetInTouchSection() {
  return (
    <div className="text-center">
      <h2 className="section-title text-center mb-content-sm">Get in Touch</h2>
      <div className="lead-text mb-content-md">
        Interested in learning more about America's Tapestry or discussing
        exhibition opportunities?
      </div>

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
  );
}
