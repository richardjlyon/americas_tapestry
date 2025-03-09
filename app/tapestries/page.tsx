import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TapestryCard } from "@/components/tapestry-card"
import { InteractiveColoniesMap } from "@/components/interactive-colonies-map"
import { InteractiveTimeline } from "@/components/interactive-timeline"
import { ColonialDataExplorer } from "@/components/colonial-data-explorer"
import { getAllTapestries } from "@/lib/tapestries"

export default function TapestriesPage() {
  const tapestries = getAllTapestries()
  
  return (
    <main className="min-h-screen bg-colonial-parchment">
      <div className="container pt-16 md:pt-20 pb-16 md:pb-20">
        <div className="py-6">
          <Button
            asChild
            variant="ghost"
            className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-colonial-navy mb-4 text-center">
          America's Tapestry Collection
        </h1>

        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="font-serif text-colonial-navy text-lg md:text-xl leading-relaxed">
            Explore our complete collection of tapestries, each telling a unique story of America's diverse cultural
            heritage. These meticulously crafted panels represent the threads that, when woven together, form the rich
            tapestry of our nation's history and identity.
          </p>
        </div>

        {/* Colonial Map Section */}
        <section className="mb-16 bg-colonial-stone p-6 md:p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-colonial-navy mb-6 text-center">The Original Thirteen Colonies</h2>
          <p className="font-serif text-colonial-navy/80 mb-8 text-center max-w-3xl mx-auto">
            Explore the tapestries representing the original thirteen colonies. Click on a colony to view its tapestry.
          </p>
          <InteractiveColoniesMap tapestries={tapestries} />
        </section>

        {/* Timeline Section */}
        <section className="mb-16 bg-colonial-stone p-6 md:p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-colonial-navy mb-6 text-center">Colonial America Timeline</h2>
          <p className="font-serif text-colonial-navy/80 mb-8 text-center max-w-3xl mx-auto">
            Explore key events in colonial American history and see how they connect to our tapestry collection.
          </p>
          <InteractiveTimeline tapestries={tapestries} />
        </section>

        {/* Data Explorer Section */}
        <section className="mb-16 bg-colonial-stone p-6 md:p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-colonial-navy mb-6 text-center">Colonial Data Explorer</h2>
          <p className="font-serif text-colonial-navy/80 mb-8 text-center max-w-3xl mx-auto">
            Analyze and compare data across all colonies through different visualization methods.
          </p>
          <ColonialDataExplorer tapestries={tapestries} />
        </section>

        {/* All Tapestries Grid */}
        <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy mb-8 text-center">All Available Tapestries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
          {tapestries.map((tapestry) => (
            <TapestryCard key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
      </div>
    </main>
  )
}