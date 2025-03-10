import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Sponsor } from '@/lib/sponsors';

interface SponsorCardProps {
  sponsor: Sponsor;
  featured?: boolean;
}

export function SponsorCard({ sponsor, featured = false }: SponsorCardProps) {
  // Define tier colors with fallback
  const tierColors: Record<string, string> = {
    Platinum: 'bg-slate-300 text-slate-900',
    Gold: 'bg-amber-300 text-amber-900', 
    Silver: 'bg-gray-300 text-gray-900',
    Bronze: 'bg-amber-700 text-amber-50',
    Supporter: 'bg-blue-100 text-blue-800',
  };

  // Get the tier color or use a default
  const tierColor = sponsor.tier && tierColors[sponsor.tier]
    ? tierColors[sponsor.tier]
    : 'bg-gray-100 text-gray-800';

  return (
    <Card
      className={`overflow-hidden transition-all ${featured ? 'border-colonial-gold shadow-md' : 'border-colonial-navy/10'}`}
    >
      {sponsor.tier && (
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start mb-2">
            <Badge className={tierColor}>
              {sponsor.tier}
            </Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className={`p-4 ${sponsor.tier ? 'pt-2' : 'pt-4'}`}>
        <div className="flex flex-col items-center mb-4">
          <div className="h-24 flex items-center justify-center mb-3 p-2">
            <img
              src={sponsor.logoPath}
              alt={`${sponsor.name} logo`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <h3 className="text-xl font-bold text-colonial-navy text-center">
            {sponsor.name}
          </h3>
          {sponsor.location && (
            <p className="text-sm text-colonial-navy/70 text-center">
              {sponsor.location}
            </p>
          )}
        </div>
        <p className="font-serif text-colonial-navy/80 line-clamp-3 text-sm">
          {sponsor.excerpt}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-colonial-burgundy border-colonial-burgundy hover:bg-colonial-burgundy/10"
        >
          <Link href={`/sponsors/${sponsor.slug}`}>Learn More</Link>
        </Button>
        {sponsor.website && sponsor.website !== '#' && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-colonial-navy/70 hover:text-colonial-navy"
          >
            <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
              Visit Website
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
