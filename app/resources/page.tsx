import Link from 'next/link';
import { ArrowRight, BookOpen, History, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageSection } from '@/components/ui/page-section';
import EducationalResourcesCard from '../../components/resources/EducationalResourcesCard';
import TapestryGlossariesCard from '../../components/resources/TapestryGlossariesCard';
import RelatedArtefactsGalleryCard from '../../components/resources/RelatedArtefactsGalleryCard';

export const metadata = {
  title: "Resources | America's Tapestry",
  description:
    "Educational resources, glossaries, and artefact galleries related to America's Tapestry project",
};

export default function ResourcesPage() {
  return (
    <>
      <h1 className="page-heading">Resources</h1>

      <p className="lead-text text-center mb-content-lg">
        Explore our collection of educational materials, technical glossaries,
        and historical artefacts that complement and enhance your understanding
        of America's Tapestry project.
      </p>

      <PageSection paddingTop="small">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <EducationalResourcesCard />
          <TapestryGlossariesCard />
          <RelatedArtefactsGalleryCard />
        </div>
      </PageSection>
    </>
  );
}
