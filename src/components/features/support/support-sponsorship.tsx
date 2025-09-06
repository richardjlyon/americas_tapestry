'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Award, Check, Mail } from 'lucide-react';
import Link from 'next/link';

interface SponsorshipTier {
  id: string;
  name: string;
  amount: string;
  description: string;
  benefits: string[];
  featured?: boolean;
}

const sponsorshipTiers: SponsorshipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    amount: '$1,000 - $4,999',
    description: "Support America's Tapestry with a Bronze level sponsorship.",
    benefits: [
      'Recognition on our website and in printed materials',
      'Invitation to annual sponsor reception',
      '10% discount on merchandise for employees',
      'Quarterly newsletter updates',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    amount: '$5,000 - $9,999',
    description: 'Provide significant support with a Silver level sponsorship.',
    benefits: [
      'All Bronze level benefits',
      'Logo placement on event signage',
      'Recognition in press releases',
      'Private tour for up to 10 guests',
      '15% discount on merchandise for employees',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    amount: '$10,000 - $24,999',
    description: 'Make a substantial impact with a Gold level sponsorship.',
    benefits: [
      'All Silver level benefits',
      'Featured logo placement on website and promotional materials',
      'Acknowledgment in exhibition catalogs',
      'Private reception for up to 20 guests',
      '20% discount on merchandise for employees',
      'Customized educational program for sponsor organization',
    ],
    featured: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    amount: '$25,000+',
    description:
      'Become a leading supporter with a Platinum level sponsorship.',
    benefits: [
      'All Gold level benefits',
      'Premier logo placement on all materials',
      'Named recognition on a tapestry panel',
      'Custom tapestry-themed event for sponsor organization',
      'VIP access to all exhibitions and events',
      '25% discount on merchandise for employees',
      'Opportunity to host a private exhibition',
    ],
    featured: true,
  },
];

export function SupportSponsorship() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-colonial-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="h-8 w-8 text-colonial-gold" />
        </div>
        <h2 className="section-title">Sponsorship Opportunities</h2>
        <p className="lead-text text-colonial-navy/80">
          Partner with America's Tapestry as an organizational sponsor and align
          your brand with our mission of preserving and celebrating America's
          diverse cultural heritage. Sponsorships provide critical support for
          our educational programs, exhibitions, and community outreach
          initiatives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sponsorshipTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`bg-white shadow-md border overflow-hidden h-full flex flex-col ${
              tier.featured
                ? 'border-colonial-gold shadow-lg'
                : 'border-colonial-navy/10'
            }`}
          >
            {tier.featured && (
              <div className="bg-colonial-gold text-colonial-navy text-center py-1 text-sm font-medium">
                Popular Choice
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-xl text-colonial-navy">
                  {tier.name} Sponsorship
                </span>
                <span className="text-lg text-colonial-burgundy font-medium">
                  {tier.amount}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="font-serif text-colonial-navy/80 mb-4">
                {tier.description}
              </p>
              <h4 className="font-medium text-colonial-navy mb-2">
                Benefits include:
              </h4>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-colonial-burgundy mr-2 flex-shrink-0" />
                    <span className="text-sm text-colonial-navy/80">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full rounded-full bg-colonial-burgundy text-colonial-parchment hover:bg-colonial-burgundy/90"
              >
                <Link href="/contact?subject=Sponsorship%20Inquiry%20-%20{tier.name}">
                  Inquire About {tier.name} Sponsorship
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-colonial-navy/5 p-6 rounded-lg border border-colonial-navy/10 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-colonial-navy mb-3">
          Custom Sponsorship Packages
        </h3>
        <p className="font-serif text-colonial-navy/80 mb-4">
          We understand that every organization is unique. We're happy to work
          with you to create a custom sponsorship package that aligns with your
          specific goals and interests. Custom sponsorships can include targeted
          support for particular tapestry panels, educational programs, or
          community initiatives.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            className="rounded-full bg-colonial-navy text-colonial-parchment hover:bg-colonial-navy/90"
          >
            <Link href="/contact?subject=Custom%20Sponsorship%20Inquiry">
              <Mail className="mr-2 h-4 w-4" />
              Contact About Custom Sponsorship
            </Link>
          </Button>
          {/* <Button
            asChild
            variant="outline"
            className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
          >
            <a
              href="/documents/sponsorship-prospectus.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Sponsorship Prospectus
            </a>
          </Button> */}
        </div>
      </div>
    </div>
  );
}
