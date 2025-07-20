import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight, Download } from "lucide-react";

export function SponsorshipSection() {
  return (
    <div
      id="sponsorship"
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
    >
      <div className="relative flex justify-center md:order-1">
        <div className="w-full md:max-w-[350px] lg:max-w-[400px]">
          <a
            href="/docs/Americas_Tapestry_Sponsorship_Proposal_FINAL.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <div className="relative">
              <Image
                src="/images/branding/americas-tapstry-sposorship-image.webp"
                alt="America's Tapestry Sponsorship Opportunities - Click to download PDF"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                  <Download className="h-6 w-6 text-colonial-navy" />
                </div>
              </div>
            </div>
          </a>
          <p className="font-serif text-sm sm:text-base text-colonial-navy/70 mt-2 italic text-center">
            Click to download our sponsorship prospectus
          </p>
        </div>
      </div>

      <div className="content-typography md:order-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-colonial-gold/10 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-colonial-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy">
            Partner With Us
          </h2>
        </div>

        <p className="text-1xl md:text-2xl leading-tight mb-4">
          Join distinguished organizations in supporting{" "}
          <em>America's Tapestry</em>
          and align your brand with our mission of preserving and celebrating
          America's diverse cultural heritage.
        </p>

        <p className="text-1xl md:text-2xl leading-tight mb-6">
          Our sponsorship opportunities provide meaningful recognition while
          supporting educational programs, exhibitions, and community outreach
          that will engage audiences nationwide during America's 250th
          anniversary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="colonial-primary">
            <Link href="/support#sponsorship">
              View Sponsorship Opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="colonial-secondary">
            <a
              href="/docs/Americas_Tapestry_Sponsorship_Proposal_FINAL.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Prospectus
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
