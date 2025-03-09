import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTeamGroups } from "@/lib/team"

export function TeamGroupsPreview() {
  const teamGroups = getTeamGroups().filter((group) => group.slug !== "project-director")

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-colonial-navy">
          Our Team
        </h2>
        <p className="font-serif text-colonial-navy mb-4 md:mb-6 leading-relaxed">
          America's Tapestry is brought to life by dedicated teams of historians, artists, and craftspeople working
          together to capture the diverse cultural narratives that make up our nation's identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {teamGroups.map((group) => (
          <div
            key={group.slug}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-colonial-navy/10 transition-all hover:shadow-lg"
          >
            <div className="p-6">
              <h3 className="text-xl md:text-2xl font-bold text-colonial-navy mb-2">{group.name}</h3>
              <p className="font-serif text-colonial-navy/80 mb-4">{group.description}</p>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy hover:text-colonial-parchment"
              >
                <Link href={`/team/${group.slug}`}>
                  Meet Our {group.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
        >
          <Link href="/team">
            View Full Team <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

