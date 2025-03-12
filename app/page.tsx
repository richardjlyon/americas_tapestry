import { HeroCarousel } from '@/components/hero-carousel';
import { LatestNewsSection } from '@/components/home/latest-news-section';
import { getAllTapestries } from '@/lib/tapestries';

import { PageSection } from '@/components/ui/page-section';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

import { AboutSection } from '@/components/home/about-section';
import { VisionSection } from '@/components/home/vision-section';
import { TapestriesSection } from '@/components/home/tapestries-section';
import { TeamSection } from '@/components/home/team-section';
import { GetInTouchSection } from '@/components/home/get-in-touch-section';

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
      <main className="flex-1 woven-linen content-spacing-sm">
        {/* Hero Section with Carousel */}
        <HeroCarousel tapestries={randomTapestries} />

        {/* About Section */}
        <PageSection paddingTop="small" hasPin={false}>
          <AboutSection />
        </PageSection>

        {/* Vision Section */}
        <PageSection paddingTop="medium" background="vintage-paper">
          <VisionSection />
        </PageSection>

        {/* Tapestry Section */}
        <PageSection paddingTop="medium">
          <TapestriesSection randomTapestries={randomTapestries} />
        </PageSection>

        {/* Team Section */}
        <PageSection paddingTop="medium" background="vintage-paper">
          <TeamSection />
        </PageSection>

        {/* Latest News Section */}
        <PageSection paddingTop="medium">
          <LatestNewsSection />
        </PageSection>

        {/* Contact Section */}
        <PageSection paddingTop="medium" background="vintage-paper">
          <GetInTouchSection />
        </PageSection>
      </main>
      <Footer />
    </div>
  );
}
