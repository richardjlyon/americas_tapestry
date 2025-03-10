import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';

export default function TestPageSection() {
  return (
    <>
      <PageSection background="colonial-parchment">
        <h1 className="page-heading">Standardized Components</h1>
        <p className="lead-text">
          This page demonstrates our new standardized components for consistent
          page structure.
        </p>
      </PageSection>

      <PageSection background="colonial-stone">
        <h2 className="section-title text-center">Section Titles</h2>
        <p className="lead-text">
          The section-title class provides consistent styling for all section
          headings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <ContentCard>
            <h3 className="text-xl font-bold mb-4">Content Card</h3>
            <p className="text-base">
              This is a content card with medium padding (default).
            </p>
          </ContentCard>

          <ContentCard padding="large" className="bg-colonial-parchment/50">
            <h3 className="text-xl font-bold mb-4">Custom Content Card</h3>
            <p className="text-base">
              This content card has large padding and a custom background.
            </p>
          </ContentCard>
        </div>
      </PageSection>

      <PageSection background="colonial-navy" className="text-white">
        <h2 className="section-title text-center text-white">
          Inverted Section
        </h2>
        <p className="lead-text text-white/90">
          Dark backgrounds work well with our components too.
        </p>

        <ContentCard className="mt-10">
          <h3 className="text-xl font-bold mb-4">Card on Dark Background</h3>
          <p className="text-base">
            Content cards stand out nicely against darker section backgrounds.
          </p>
        </ContentCard>
      </PageSection>

      <PageSection background="white">
        <h2 className="section-title text-center">Content and Typography</h2>
        <p className="lead-text">
          Our system includes consistent typography for rich content.
        </p>

        <ContentCard className="content-typography mt-10">
          <h3>Rich Text Content</h3>
          <p>
            This content uses the content-typography class for styling rich text
            from markdown or CMS sources.
          </p>
          <p>It includes styles for paragraphs, headings, links, and more.</p>
          <blockquote>
            <p>Blockquotes are also styled consistently across the site.</p>
          </blockquote>
          <p>
            This approach ensures that all content areas maintain the same
            visual language.
          </p>
        </ContentCard>
      </PageSection>
    </>
  );
}
