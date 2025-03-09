import Link from "next/link"
import { ArrowRight, ShoppingBag, Heart, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SupportMerchandise } from "@/components/support-merchandise"
import { SupportDonations } from "@/components/support-donations"
import { SupportVolunteer } from "@/components/support-volunteer"
import { SupportSponsorship } from "@/components/support-sponsorship"

export const metadata = {
  title: "Support Our Project | America's Tapestry",
  description:
    "Discover ways to support America's Tapestry through merchandise, donations, volunteer opportunities, and sponsorships.",
}

export default function SupportPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-colonial-navy text-colonial-parchment pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="container mx-auto text-center">
          <div className="content-typography">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-colonial-parchment">
              Support America's Tapestry
            </h1>
            <p className="text-xl md:text-2xl text-colonial-parchment/90 max-w-3xl mx-auto leading-relaxed">
              Join us in preserving and celebrating America's diverse cultural heritage through our tapestry project. Your
              support helps us continue our mission of education, preservation, and community building.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options Navigation */}
      <section className="bg-colonial-parchment py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="bg-white shadow-md border border-colonial-navy/10 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-colonial-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-colonial-gold" />
                </div>
                <CardTitle className="text-xl text-colonial-navy">Merchandise</CardTitle>
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
            </Card>

            <Card className="bg-white shadow-md border border-colonial-navy/10 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-colonial-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-colonial-burgundy" />
                </div>
                <CardTitle className="text-xl text-colonial-navy">Donations</CardTitle>
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
                <CardTitle className="text-xl text-colonial-navy">Volunteer</CardTitle>
                <CardDescription className="text-colonial-navy/70">Contribute your time and skills</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center pb-6">
                <Button
                  variant="outline"
                  className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
                  asChild
                >
                  <a href="#volunteer">
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
                <CardTitle className="text-xl text-colonial-navy">Sponsorship</CardTitle>
                <CardDescription className="text-colonial-navy/70">Partner with us as an organization</CardDescription>
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
        </div>
      </section>

      {/* Merchandise Section */}
      <section id="merchandise" className="py-16 bg-colonial-stone scroll-mt-24">
        <div className="container mx-auto">
          <SupportMerchandise />
        </div>
      </section>

      {/* Donations Section */}
      <section id="donations" className="py-16 bg-colonial-parchment scroll-mt-24">
        <div className="container mx-auto">
          <SupportDonations />
        </div>
      </section>

      {/* Volunteer Section */}
      <section id="volunteer" className="py-16 bg-colonial-stone scroll-mt-24">
        <div className="container mx-auto">
          <SupportVolunteer />
        </div>
      </section>

      {/* Sponsorship Section */}
      <section id="sponsorship" className="py-16 bg-colonial-parchment scroll-mt-24">
        <div className="container mx-auto">
          <SupportSponsorship />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-colonial-navy text-colonial-parchment">
        <div className="container mx-auto text-center">
          <div className="content-typography">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Join Our Community of Supporters</h2>
            <p className="text-lg md:text-xl text-colonial-parchment/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Every contribution, whether through purchases, donations, volunteering, or sponsorships, helps us preserve
              and share America's rich cultural tapestry for generations to come.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90">
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
      </section>
    </main>
  )
}

