import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Jane Doe',
    role: 'Project Director',
    bio: "Jane is the visionary behind America's Tapestry, bringing over 15 years of experience in textile arts and cultural preservation.",
    image: '/images/placeholders/placeholder.svg?height=400&width=400',
  },
  {
    name: 'Robert Smith',
    role: 'Lead Historian',
    bio: 'Robert specializes in American cultural history and ensures historical accuracy across all tapestry panels.',
    image: '/images/placeholders/placeholder.svg?height=400&width=400',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Master Weaver',
    bio: 'Maria oversees the creation of each tapestry, bringing traditional techniques and innovative approaches to the project.',
    image: '/images/placeholders/placeholder.svg?height=400&width=400',
  },
  {
    name: 'David Chen',
    role: 'Community Outreach',
    bio: 'David coordinates with communities across America to ensure diverse perspectives are represented in the tapestries.',
    image: '/images/placeholders/placeholder.svg?height=400&width=400',
  },
];

export function Team() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-colonial-navy">
          Our Team
        </h2>
        <p className="font-serif text-colonial-navy mb-4 md:mb-6 leading-relaxed">
          America's Tapestry is brought to life by a dedicated team of
          historians, artists, and craftspeople working together to capture the
          diverse cultural narratives that make up our nation's identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="flex flex-col sm:flex-row gap-6 items-start"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-colonial-navy/10 flex-shrink-0 mx-auto sm:mx-0 relative">
              <Image
                src={getImagePath(member.image || '/images/placeholders/placeholder.svg')}
                alt={member.name}
                fill
                sizes={getImageSizes('thumbnail')}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xl text-colonial-navy mb-1 text-center sm:text-left">
                {member.name}
              </h3>
              <p className="font-serif text-colonial-burgundy mb-2 text-center sm:text-left">
                {member.role}
              </p>
              <p className="font-serif text-colonial-navy/80 leading-relaxed">
                {member.bio}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy hover:text-colonial-parchment"
        >
          <Link href="/about-team">
            Meet the Full Team <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
