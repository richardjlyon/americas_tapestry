import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RelatedArtefactsGalleryCard() {
  return (
    <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="w-12 h-12 rounded-full bg-colonial-navy/10 flex items-center justify-center mb-4">
          <History className="h-6 w-6 text-colonial-navy" />
        </div>
        <CardTitle className="text-xl text-colonial-navy">
          Related Artefacts Gallery
        </CardTitle>
        <CardDescription className="text-colonial-navy/70">
          Historical items and inspirations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-serif text-colonial-navy/80">
          Explore a curated collection of historical items and artefacts that
          inspired or are thematically connected to the America's Tapestry
          project. Each item is presented with historical context and its
          relationship to our tapestry panels.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className="w-full rounded-full bg-colonial-navy hover:bg-colonial-navy/90"
        >
          <Link href="/resources/artefacts">
            Browse Gallery <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
