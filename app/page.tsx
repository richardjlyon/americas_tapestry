import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tapestry } from '@/components/tapestry';
import { VideoPlayer } from '@/components/video-player';
import { HeroCarousel } from '@/components/hero-carousel';
import { LatestNewsSection } from '@/components/latest-news-section';
import { getAllTapestries } from '@/lib/tapestries';
import { Divide, SignpostBig, Users2 } from 'lucide-react';
import { TeamGroupsPreview } from '@/components/team-groups-preview';
import { PageSection } from '@/components/ui/page-section';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function Home() {
  const allTapestries = getAllTapestries();

  // Filter for tapestries that have both a valid status and an image
  const eligibleTapestries = allTapestries.filter((tapestry) => {
    const hasImage = !!(tapestry.imagePath || tapestry.thumbnail);
    const isInProgress = tapestry.status !== 'Not Started';
    return isInProgress && hasImage;
  });

  const randomTapestries = [...eligibleTapestries]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Carousel */}
        <HeroCarousel tapestries={randomTapestries} />

        {/* About Section */}
        <PageSection background="colonial-parchment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="content-typography">
              <h2 className="section-title mt-0 pt-0">About the Project</h2>
              <p className="font-medium text-2xl">
                In 2026, Americans will celebrate our country's 250th
                anniversary. To commemorate this occasion,{' '}
                <em>America's Tapestry</em> weaves together stories from our
                nation's founding through the medium of embroidery.
              </p>
              <p className="text-2xl">
                Thirteen embroidered panels have been designed by our creative
                team in collaboration with historical organizations from each of
                the original colonies. Embroiderers within each state, led by
                our state directors, are stitching the panels over 18 months.
                The Tapestry will be exhibited in prominent gallery spaces in
                2026 and 2027.
              </p>
              <p className="text-2xl">
                <em>America's Tapestry</em> enriches our understanding of our
                shared heritage, while promoting the art of American needlework.
                Through our virtual and in-person programming, visitors can
                learn about the revolution and engage in the historic practice
                of needlework.
              </p>
            </div>
            <div className="relative flex justify-center mt-8 md:mt-0">
              <div className="max-w-[280px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] w-full">
                <VideoPlayer
                  src="/video/250305-short-promotional/250305-short-promotional-v2-lowres.mp4"
                  highResSrc="/video/250305-short-promotional/250305-short-promotional-v2.mp4"
                  poster="`/video/250305-short-promotional/250305-short-promotional-v2-poster.png"
                  className="aspect-[9/16] w-full"
                />
                <p className="font-serif text-sm sm:text-base text-colonial-navy/70 mt-2 italic text-center">
                  Documentary excerpt: "The Making of America's Tapestry"
                </p>
              </div>
            </div>
          </div>
        </PageSection>

        {/* Vision Section */}
        <PageSection background="colonial-stone">
          <h2 className="section-title text-center">Our Vision</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Preserve History Card */}
            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
              <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Divide className="h-8 w-8 text-colonial-burgundy" />
              </div>
              <h3 className="text-xl font-bold text-colonial-burgundy mb-4">
                Preserve History
              </h3>
              <p className="font-serif text-colonial-navy/80 leading-relaxed">
                Create a lasting artistic record of America's founding that will
                educate and inspire future generations.
              </p>
            </div>

            {/* Educate Americans Card */}
            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
              <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <SignpostBig className="h-8 w-8 text-colonial-burgundy" />
              </div>
              <h3 className="text-xl font-bold text-colonial-burgundy mb-4">
                Educate Young Americans
              </h3>
              <p className="font-serif text-colonial-navy/80 leading-relaxed">
                Provide educational resources that bring colonial history to
                life through art and storytelling.
              </p>
            </div>

            {/* Build Community Card */}
            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
              <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users2 className="h-8 w-8 text-colonial-burgundy" />
              </div>
              <h3 className="text-xl font-bold text-colonial-burgundy mb-4">
                Promote needleworking
              </h3>
              <p className="font-serif text-colonial-navy/80 leading-relaxed">
                Promoting needlework arts across America, inspiring creativity,
                and preserving traditional craftsmanship.
              </p>
            </div>
          </div>
        </PageSection>

        {/* Tapestry Section */}
        <PageSection background="colonial-parchment">
          <h2 className="section-title text-center">The Tapestry Collection</h2>
          <Tapestry tapestries={randomTapestries} />
          <div className="text-center mt-10 md:mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
            >
              <Link href="/tapestries">
                Explore All Thirteen Colonies{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </PageSection>

        {/* Team Section */}
        <PageSection background="colonial-stone">
          <TeamGroupsPreview />
        </PageSection>

        {/* Latest News Section */}
        <LatestNewsSection />

        {/* Contact Section */}
        <PageSection
          background="colonial-navy"
          className="text-colonial-parchment"
        >
          <div className="text-center">
            <h2 className="section-title text-colonial-parchment">
              Get in Touch
            </h2>
            <p className="lead-text text-colonial-parchment/90">
              Interested in learning more about America's Tapestry or discussing
              exhibition opportunities?
            </p>
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
        </PageSection>
      </main>
      <Footer />
    </div>
  );
}
