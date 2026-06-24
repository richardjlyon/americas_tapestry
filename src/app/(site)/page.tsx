import { HeroCarousel } from '@/components/shared/hero-carousel';
import { LatestNewsSection } from '@/components/features/home/latest-news-section';
import { getAllTapestries, getCarouselImages } from '@/lib/tapestries';

import { PageSection } from '@/components/ui/page-section';

import { AboutSection } from '@/components/features/home/about-section';
import { VisionSection } from '@/components/features/home/vision-section';
import { TapestriesSection } from '@/components/features/home/tapestries-section';
import { GetInTouchSection } from '@/components/features/home/get-in-touch-section';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Embroidering the Story of the 13 Colonies',
  description:
    "America's Tapestry tells the stories of the original thirteen colonies through embroidery, created for America's 250th anniversary.",
  path: '/',
});

export default async function Home() {
  const allTapestries = await getAllTapestries();
  const carouselImages = getCarouselImages();

  // Filter for tapestries that have both a valid status and an image
  const eligibleTapestries = allTapestries.filter((tapestry) => {
    const hasImage = !!(tapestry.imagePath || tapestry.thumbnail);
    const isInProgress = tapestry.status !== 'Not Started';
    return isInProgress && hasImage;
  });

  // Combine carousel images with eligible tapestries
  const allCarouselItems = [...carouselImages, ...eligibleTapestries];

  // Shuffle all items for the carousel
  const randomCarouselItems = [...allCarouselItems].sort(
    () => 0.5 - Math.random(),
  );

  // Keep random tapestries for the tapestries section (only actual tapestries)
  const randomTapestries = [...eligibleTapestries]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Site chrome (Header/Footer) is provided by the (site) route-group layout.
  return (
    <>
      {/* Hero Section with Carousel */}
      <HeroCarousel tapestries={randomCarouselItems} />

      {/* About Section */}
      <PageSection paddingTop="small">
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

      {/* Latest News Section */}
      <PageSection paddingTop="medium">
        <LatestNewsSection />
      </PageSection>

      {/* Contact Section */}
      <PageSection paddingTop="medium">
        <GetInTouchSection />
      </PageSection>
    </>
  );
}
