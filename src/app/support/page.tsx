import Link from "next/link";
import { ArrowRight, Heart, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { SupportDonations } from "@/components/features/support/support-donations";
import { SupportSponsorship } from "@/components/features/support/support-sponsorship";
import { PageSection } from "@/components/ui/page-section";

export const metadata = {
  title: "Support Our Project | America's Tapestry",
  description:
    "Discover ways to support America's Tapestry through merchandise, donations, volunteer opportunities, and sponsorships.",
};

export default function SupportPage() {
  return (
    <>
      {/* Hero Section */}

      <h1 className="page-heading">Support America's Tapestry</h1>

      <p className="lead-text">
        Join us in preserving and celebrating America's diverse cultural
        heritage through our tapestry project. Your support helps us continue
        our mission of education, preservation, and community building.
      </p>

      {/* Support Options Navigation */}
      <PageSection spacing="tight">
        {/* Set this to 4 columns if merchandise is available */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Merchandise */}
          {/* <Card className="bg-white shadow-md border border-colonial-navy/10 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-colonial-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-colonial-gold" />
              </div>
              <CardTitle className="text-xl text-colonial-navy">
                Merchandise
              </CardTitle>
              <CardDescription className="text-colonial-navy/70">
                Purchase items that support our mission
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-6">
              <Button
                variant="outline"
                className="rounded-full border-colonial-gold text-colonial-gold hover:bg-colonial-gold hover:text-colonial-navy"
                asChild
              >
                <a href="#merchandise">
                  View Merchandise <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card> */}

          <Card className="bg-white shadow-md border border-colonial-navy/10 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-colonial-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-colonial-burgundy" />
              </div>
              <CardTitle className="text-xl text-colonial-navy">
                Donations
              </CardTitle>
              <CardDescription className="text-colonial-navy/70">
                Contribute financially to our project
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-6">
              <Button
                variant="outline"
                className="rounded-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy hover:text-colonial-parchment"
                asChild
              >
                <a href="#donations">
                  Make a Donation <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white shadow-md border border-colonial-navy/10 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-colonial-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-colonial-navy" />
              </div>
              <CardTitle className="text-xl text-colonial-navy">
                Volunteer
              </CardTitle>
              <CardDescription className="text-colonial-navy/70">
                For details on contributing your time and skills, please email
                us
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex justify-center pb-6">
              <Button
                variant="outline"
                className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
                asChild
              >
                <a href="/contact">
                  Volunteer With Us <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white shadow-md border border-colonial-navy/10 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-colonial-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-colonial-gold" />
              </div>
              <CardTitle className="text-xl text-colonial-navy">
                Sponsorship
              </CardTitle>
              <CardDescription className="text-colonial-navy/70">
                Partner with us as an organization
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-6">
              <Button
                variant="outline"
                className="rounded-full border-colonial-gold text-colonial-gold hover:bg-colonial-gold hover:text-colonial-navy"
                asChild
              >
                <a href="#sponsorship">
                  Become a Sponsor <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageSection>

      {/* Merchandise Section */}
      {/* <PageSection id="merchandise" paddingTop="none" className="scroll-mt-24">
        <SupportMerchandise />
      </PageSection> */}

      {/* Donations Section */}
      {/*<PageSection id="donations" spacing="normal" className="scroll-mt-24">
        <SupportDonations />
      </PageSection>*/}

      {/* Volunteer Section */}
      {/* <PageSection id="volunteer" paddingTop="none" className="scroll-mt-24">
        <SupportVolunteer />
      </PageSection> */}

      {/* Sponsorship Section */}
      <PageSection id="sponsorship" spacing="normal" className="scroll-mt-24">
        <SupportSponsorship />
      </PageSection>

      {/* Call to Action */}
      <PageSection
        background="colonial-navy"
        className="text-colonial-parchment"
      >
        <div className="text-center">
          <div className="content-typography">
            <h2 className="section-title text-colonial-parchment">
              Join Our Community of Supporters
            </h2>
            <p className="lead-text text-colonial-parchment/90 max-w-3xl mx-auto mb-8">
              Every contribution, whether through purchases, donations,
              volunteering, or sponsorships, helps us preserve and share
              America's rich cultural tapestry for generations to come.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90"
            >
              <Link href="/contact">Contact Us With Questions</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-colonial-parchment text-colonial-parchment hover:bg-colonial-parchment/20"
            >
              <Link href="/team">Meet Our Team</Link>
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  );
}
