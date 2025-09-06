import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImagePath, getImageSizes } from '@/lib/image-utils';
import type { Sponsor } from '@/lib/sponsors';

interface SponsorCardProps {
  sponsor: Sponsor;
  featured?: boolean;
  excerptHtml?: string;
}

export function SponsorCard({
  sponsor,
  featured = false,
  excerptHtml,
}: SponsorCardProps) {
  // Define tier colors with fallback
  const tierColors: Record<string, string> = {
    Platinum: 'bg-slate-300 text-slate-900',
    Gold: 'bg-amber-300 text-amber-900',
    Silver: 'bg-gray-300 text-gray-900',
    Bronze: 'bg-amber-700 text-amber-50',
    Supporter: 'bg-blue-100 text-blue-800',
  };

  // Get tier color or default
  const tierColor =
    sponsor.tier && tierColors[sponsor.tier]
      ? tierColors[sponsor.tier]
      : 'bg-gray-100 text-gray-800';

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-colonial-navy/10 overflow-hidden transition-all hover:shadow-lg ${featured ? 'border-colonial-gold' : ''}`}
    >
      <div className="p-6">
        {/* Tier Badge */}
        {sponsor.tier && (
          <div className="flex justify-center mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${tierColor}`}
            >
              {sponsor.tier}
            </span>
          </div>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="h-20 w-32 relative">
            <Image
              src={getImagePath(sponsor.logoPath)}
              alt={`${sponsor.name} logo`}
              fill
              sizes={getImageSizes('thumbnail')}
              className="object-contain"
            />
          </div>
        </div>

        {/* Sponsor Info */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-colonial-navy mb-3">
            {sponsor.name}
          </h3>

          {sponsor.location && (
            <p className="text-base text-colonial-navy/70 mb-2">
              {sponsor.location}
            </p>
          )}

          {sponsor.partnership_year && (
            <p className="text-base text-colonial-navy/60">
              Partner since {sponsor.partnership_year}
            </p>
          )}
        </div>

        {/* Excerpt */}
        {(excerptHtml || sponsor.excerpt) && (
          <div className="mb-6">
            {excerptHtml ? (
              <div
                className="text-base text-colonial-navy/80 line-clamp-4 content-typography prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: excerptHtml }}
              />
            ) : (
              <p className="text-base text-colonial-navy/80 line-clamp-4">
                {sponsor.excerpt}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center gap-2">
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
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
