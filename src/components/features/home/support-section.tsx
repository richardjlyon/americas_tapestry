import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ContentCard } from "@/components/ui/content-card";
import { Button } from "@/components/ui/button";

/**
 * Support Section Component
 *
 * Promotes Liberty dolls from Stefan Romero as a way to support America's Tapestry project.
 * Features a tasteful presentation with compelling copy and imagery that connects
 * merchandise purchases to project support.
 */
export function SupportSection() {
  return (
    <>
      <SectionHeader
        title="Support Our Project"
        description={
          <>
            Help preserve America's cultural heritage by supporting{" "}
            <em>America's Tapestry</em> through the purchase of exquisite
            handcrafted Liberty dolls—tomorrow's heirlooms that celebrate our
            nation's founding story.
          </>
        }
      />

      <ContentCard className="overflow-hidden">
        <div className="flex flex-col md:flex-row gap-0">
          {/* Image Section - Left side on desktop, full width on mobile */}
          <div className="w-full md:w-1/3 relative aspect-[3/2] overflow-hidden group">
            <Image
              src="/support/liberty-dolls.jpg"
              alt="Handcrafted Liberty dolls by Stefan Romero - Limited edition art dolls supporting America's Tapestry"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          </div>

          {/* Content Section - Right side on desktop */}
          <div className="w-full md:w-2/3 p-6 md:p-8 lg:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-colonial-burgundy/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-colonial-burgundy" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-colonial-navy mb-2">
                  Collectible Art with Purpose
                </h3>
                <p className="font-serif text-colonial-navy/80">
                  Each Liberty doll is a limited edition work of extraordinary
                  artistry, handcrafted by Project Director Stefan Remoro.
                </p>
              </div>
            </div>

            <div className="space-y-4 font-serif text-colonial-navy/80">
              <p>
                These art dolls honor the spirit of American independence and
                craftsmanship. By acquiring a Liberty doll, you become a patron
                of both fine art and living history.
              </p>

              <p>
                All proceeds from each purchase support{" "}
                <em className="text-colonial-navy">America's Tapestry</em>,
                helping fund our educational programs, exhibitions, and the
                preservation of traditional needlework arts.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-colonial-navy/10 flex justify-center">
              <Button
                asChild
                variant="colonial-primary"
                className="text-base py-2 px-6"
              >
                <Link
                  href="https://www.stefanromero.com/collections/liberty"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore Liberty Doll Collection{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ContentCard>
    </>
  );
}
