import Link from 'next/link';
import { ArrowRight, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TapestryGlossariesCard() {
  return (
    <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="w-12 h-12 rounded-full bg-colonial-gold/10 flex items-center justify-center mb-4">
          <Gauge className="h-6 w-6 text-colonial-gold" />
        </div>
        <CardTitle className="text-xl text-colonial-navy">
          Tapestry Glossaries
        </CardTitle>
        <CardDescription className="text-colonial-navy/70">
          Technical terms and traditional methods
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-serif text-colonial-navy/80">
          Discover the rich vocabulary and techniques used in traditional
          tapestry making. Our glossaries provide detailed explanations of
          stitching methods, materials, tools, and specialized terminology used
          throughout the America's Tapestry project.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className="w-full rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90"
        >
          <Link href="/resources/glossary">
            View Glossaries <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
