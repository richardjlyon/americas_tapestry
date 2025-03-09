import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TeamMemberCard } from "@/components/team-member-card"
import { getTeamGroup, getTeamGroups, getTeamMembersByGroup } from "@/lib/team"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const groups = getTeamGroups()

  return groups.map((group) => ({
    group: group.slug,
  }))
}

export default function TeamGroupPage({ params }: { params: { group: string } }) {
  const group = getTeamGroup(params.group)

  if (!group) {
    notFound()
  }

  const members = getTeamMembersByGroup(params.group)

  return (
    <main className="flex-1 pt-20 md:pt-24">
      <section className="bg-colonial-parchment py-12 md:py-16">
        <div className="container mx-auto">
          <div className="mb-6">
            <Button
              asChild
              variant="ghost"
              className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
            >
              <Link href="/team">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Team
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-colonial-navy mb-6 text-center">
            {group.name}
          </h1>

          <div className="max-w-3xl mx-auto mb-12">
            <p className="font-serif text-colonial-navy text-lg md:text-xl text-center leading-relaxed">
              {group.longDescription || group.description}
            </p>
          </div>

          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <TeamMemberCard key={member.slug} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-serif text-colonial-navy/70 text-lg">No team members found in this group.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

