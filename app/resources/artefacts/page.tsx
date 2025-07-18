import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

export const metadata = {
  title: "Related Artefacts Gallery | America's Tapestry",
  description:
    "Visual showcase of historical items and artefacts related to the America's Tapestry project",
};

interface Artefact {
  title: string;
  description: string;
  date: string;
  origin: string;
  institution: string;
  institutionUrl: string;
  image: string;
  category: 'textiles' | 'documents' | 'tools' | 'artwork';
  relatedColony?: string;
}

// Dummy data for artefacts
const artefacts: Artefact[] = [
  {
    title: 'Embroidered Sampler by Mary Williams',
    description:
      'This early 18th-century sampler showcases various embroidery stitches and techniques practiced by young women in colonial America. The imagery includes alphabets, numerals, and pastoral scenes typical of the period.',
    date: 'c. 1723',
    origin: 'Massachusetts',
    institution: 'Museum of Fine Arts, Boston',
    institutionUrl: 'https://www.mfa.org',
    image: '/placeholder.svg?height=500&width=600&text=Historical+Sampler',
    category: 'textiles',
    relatedColony: 'Massachusetts',
  },
  {
    title: 'Quilted Petticoat',
    description:
      "This elaborately quilted petticoat represents the high level of needlework skill among colonial women. The detailed floral patterns would have been visible when the outer skirt was gathered up, displaying both the garment and the wearer's handiwork.",
    date: 'c. 1750-1770',
    origin: 'Virginia',
    institution: 'Colonial Williamsburg Foundation',
    institutionUrl: 'https://www.colonialwilliamsburg.org',
    image: '/placeholder.svg?height=500&width=600&text=Colonial+Petticoat',
    category: 'textiles',
    relatedColony: 'Virginia',
  },
  {
    title: 'Letter from Eliza Lucas Pinckney on Indigo Cultivation',
    description:
      "This handwritten letter details Eliza Lucas Pinckney's successful experiments with indigo cultivation in South Carolina, which became a crucial export crop. The document provides insights into colonial agricultural innovations and the natural dyes used in textile production.",
    date: '1744',
    origin: 'South Carolina',
    institution: 'South Carolina Historical Society',
    institutionUrl: 'https://schistory.org',
    image: '/placeholder.svg?height=500&width=600&text=Historical+Letter',
    category: 'documents',
    relatedColony: 'South Carolina',
  },
  {
    title: 'Colonial Flax Hackle',
    description:
      'This wooden tool with metal teeth was used to separate flax fibers in preparation for spinning into linen thread. The processing of flax was labor-intensive but essential for creating the linen textiles that were ubiquitous in colonial households.',
    date: 'c. 1760',
    origin: 'Pennsylvania',
    institution: 'Winterthur Museum',
    institutionUrl: 'https://www.winterthur.org',
    image: '/placeholder.svg?height=500&width=600&text=Flax+Hackle',
    category: 'tools',
    relatedColony: 'Pennsylvania',
  },
  {
    title: 'Portrait of a Colonial Dame with Embroidered Dress',
    description:
      'This oil painting depicts a wealthy colonial woman wearing an intricately embroidered dress, showcasing the importance of textile artistry as a symbol of status and refinement in colonial society.',
    date: 'c. 1765',
    origin: 'New York',
    institution: 'Metropolitan Museum of Art',
    institutionUrl: 'https://www.metmuseum.org',
    image: '/placeholder.svg?height=500&width=600&text=Colonial+Portrait',
    category: 'artwork',
    relatedColony: 'New York',
  },
  {
    title: 'Wampum Belt',
    description:
      'This ceremonial belt made from white and purple shell beads represents an important diplomatic agreement between Native American tribes and European colonists. Wampum belts served as historical records and were integral to treaty-making in colonial America.',
    date: 'c. 1700-1750',
    origin: 'Northeastern Woodland Tribes',
    institution: 'National Museum of the American Indian',
    institutionUrl: 'https://americanindian.si.edu',
    image: '/placeholder.svg?height=500&width=600&text=Wampum+Belt',
    category: 'artwork',
    relatedColony: 'New York',
  },
];

export default function ArtefactsGalleryPage() {
  return (
    <>
      <h1 className="page-heading">Related Artefacts Gallery</h1>

      <p className="lead-text text-center mb-content-lg">
        Explore historical items and artefacts that are thematically connected
        to the America's Tapestry project. These items have either inspired our
        tapestry designs or provide important historical context for the stories
        our tapestries tell. Each item is presented with information about its
        origin, age, and significance.
      </p>

      <PageSection paddingTop="none">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-8">
            <TabsTrigger value="all">All Artefacts</TabsTrigger>
            <TabsTrigger value="textiles">Textiles</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="artwork">Artwork</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artefacts.map((artefact, index) => (
                <ArtefactCard key={index} artefact={artefact} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="textiles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artefacts
                .filter((artefact) => artefact.category === 'textiles')
                .map((artefact, index) => (
                  <ArtefactCard key={index} artefact={artefact} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artefacts
                .filter((artefact) => artefact.category === 'documents')
                .map((artefact, index) => (
                  <ArtefactCard key={index} artefact={artefact} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artefacts
                .filter((artefact) => artefact.category === 'tools')
                .map((artefact, index) => (
                  <ArtefactCard key={index} artefact={artefact} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="artwork" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artefacts
                .filter((artefact) => artefact.category === 'artwork')
                .map((artefact, index) => (
                  <ArtefactCard key={index} artefact={artefact} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <ContentCard className="mt-12 max-w-3xl mx-auto">
          <h2 className="section-title">Visit Our Museum Partners</h2>
          <p className="font-serif text-colonial-navy/80 mb-4">
            Many of these artefacts can be viewed in person at our museum
            partners across the country. Plan a visit to see these historical
            treasures up close and learn more about America's textile heritage.
          </p>
          <Button
            asChild
            className="rounded-full bg-colonial-navy hover:bg-colonial-navy/90"
          >
            <Link href="/team/historical-partners">View Museum Partners</Link>
          </Button>
        </ContentCard>
      </PageSection>
    </>
  );
}

function ArtefactCard({ artefact }: { artefact: Artefact }) {
  const categoryColors = {
    textiles: 'bg-colonial-burgundy text-colonial-parchment',
    documents: 'bg-colonial-gold text-colonial-navy',
    tools: 'bg-colonial-navy text-colonial-parchment',
    artwork: 'bg-green-700 text-white',
  };

  return (
    <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={getImagePath(artefact.image || '/placeholder.svg')}
          alt={artefact.title}
          fill
          sizes={getImageSizes('card')}
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[artefact.category]}`}
        >
          {artefact.category.charAt(0).toUpperCase() +
            artefact.category.slice(1)}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-colonial-navy">
          {artefact.title}
        </CardTitle>
        <CardDescription className="text-colonial-navy/70">
          {artefact.date} • {artefact.origin}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-serif text-colonial-navy/80 text-sm">
          {artefact.description}
        </p>
        {artefact.relatedColony && (
          <div className="mt-3 text-sm">
            <span className="font-medium text-colonial-navy/70">
              Related Colony:{' '}
            </span>
            <Link
              href={`/tapestry/${artefact.relatedColony.toLowerCase()}`}
              className="text-colonial-burgundy hover:underline"
            >
              {artefact.relatedColony}
            </Link>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm">
        <a
          href={artefact.institutionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-colonial-navy/70 hover:text-colonial-burgundy flex items-center transition-colors"
        >
          {artefact.institution}
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
}
