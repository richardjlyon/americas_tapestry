import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function EducationalResourcesCard() {
  return (
    <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="w-12 h-12 rounded-full bg-colonial-burgundy/10 flex items-center justify-center mb-4">
          <BookOpen className="h-6 w-6 text-colonial-burgundy" />
        </div>
        <CardTitle className="text-xl text-colonial-navy">
          Educational Resources
        </CardTitle>
        <CardDescription className="text-colonial-navy/70">
          Teaching materials and activities for educators
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-serif text-colonial-navy/80">
          Access lesson plans, educational materials, historical fact sheets,
          and interactive activities designed for educators at all levels. Our
          resources are aligned with curriculum standards and cover various
          aspects of American history and textile arts.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className="w-full rounded-full bg-colonial-burgundy hover:bg-colonial-burgundy/90"
        >
          <Link href="/resources/educational">
            Explore Resources <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
