'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// interface DonationTier {
//   id: string;
//   name: string;
//   amount: number;
//   description: string;
//   benefits: string[];
// }

// Donation tiers configuration for future implementation
/*
const donationTiers: DonationTier[] = [
  {
    id: "supporter",
    name: "Supporter",
    amount: 50,
    description:
      "Help us continue our educational programs and tapestry creation.",
    benefits: [
      "Recognition on our website",
      "Quarterly email newsletter",
      "Digital wallpaper of your favorite tapestry panel",
    ],
  },
  {
    id: "patron",
    name: "Patron",
    amount: 100,
    description:
      "Provide significant support for our ongoing tapestry projects.",
    benefits: [
      "All Supporter benefits",
      "America's Tapestry commemorative pin",
      "10% discount on merchandise purchases",
    ],
  },
  {
    id: "benefactor",
    name: "Benefactor",
    amount: 250,
    description:
      "Make a substantial impact on our ability to preserve cultural heritage.",
    benefits: [
      "All Patron benefits",
      "Exclusive behind-the-scenes digital content",
      "Invitation to annual virtual event with project directors",
      "15% discount on merchandise purchases",
    ],
  },
  {
    id: "guardian",
    name: "Guardian",
    amount: 500,
    description:
      "Become a guardian of America's cultural tapestry for future generations.",
    benefits: [
      "All Benefactor benefits",
      "Limited edition print of your choice",
      "Personal acknowledgment in our annual report",
      "20% discount on merchandise purchases",
    ],
  },
];
*/

export function SupportDonations() {
  // State variables for future donation form implementation
  // const [_selectedTier, _setSelectedTier] = useState<string>("supporter");
  // const [_customAmount, _setCustomAmount] = useState<string>("");

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-colonial-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-colonial-burgundy" />
        </div>

        <h2 className="section-title">Make a Donation</h2>

        <p className="lead-text text-colonial-navy/80">
          Your financial contribution directly supports the creation,
          preservation, and exhibition of <em>America's Tapestry</em>. Donations
          help fund materials, exhibitions, educational programs, and community
          outreach initiatives. <em>America's Tapestry</em>'s partner Seton Hill
          University, a 501(c)(3) nonprofit organization, collects all donations
          on our behalf. All donations are tax-deductible.
        </p>
      </div>

      <div className="w-full flex justify-center p-8">
        <div className="w-full max-w-xl">
          <Card className="bg-white shadow-md border border-colonial-navy/10">
            <CardHeader>
              <CardTitle className="text-xl text-colonial-navy">
                How to Donate
              </CardTitle>
              <CardDescription>
                Thank you so much! Here's how to donate via Seton Hill
                University's donation page...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xl">
              The button below takes you to Seton Hill University's donation
              page. When completing the form, please select "Designation: Other"
              and then type "America's Tapestry" in the "Other" field.
              <div className="relative my-4 aspect-video overflow-hidden rounded-md border border-colonial-navy/10 shadow-lg">
                <Image
                  src="/images/content/donation-example.png"
                  alt="Example of donation form showing 'Designation Other' selected and 'America's Tapestry' typed in the field."
                  fill
                  className="object-contain"
                />
              </div>
              <div className="pt-4 border-t border-colonial-navy/10">
                <p className="text-sm text-colonial-navy/70">
                  If you encounter difficulties giving online, please call Seton
                  Hill University help line at 1-877-SHU-GIFT (748.4438)
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full rounded-full bg-colonial-burgundy text-colonial-parchment hover:bg-colonial-burgundy/90"
              >
                <Link href="https://alumni.setonhill.edu/GiveSHU">
                  Proceed to Donation
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
