import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTeamGroups, getTeamMembersByGroup, getTeamMember } from "@/lib/team"
import { notFound } from "next/navigation"
import { remark } from "remark"
import html from "remark-html"
import { PageSection } from "@/components/ui/page-section"
import { ContentCard } from "@/components/ui/content-card"

export async function generateStaticParams() {
  const groups = getTeamGroups()
  const params = []

  for (const group of groups) {
    const members = getTeamMembersByGroup(group.slug)

    for (const member of members) {
      params.push({
        group: group.slug,
        member: member.slug,
      })
    }
  }

  return params
}

export default async function TeamMemberPage({ params }: { params: { group: string; member: string } }) {
  const member = getTeamMember(params.group, params.member)

  if (!member) {
    notFound()
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(member.content)
  const contentHtml = processedContent.toString()

  // Default placeholder image if no image is found
  const imageSrc = member.imagePath || `/placeholder.svg?height=800&width=600&text=${encodeURIComponent(member.name)}`

  return (
    <PageSection background="colonial-parchment">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
        >
          <Link href={`/team/${params.group}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to{" "}
            {params.group
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Link>
        </Button>
      </div>

      <ContentCard className="overflow-hidden p-0 max-w-4xl mx-auto">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="h-80 md:h-full relative">
              <img src={imageSrc || "/placeholder.svg"} alt={member.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:w-2/3 p-6 md:p-8">
            <div className="border-b border-colonial-gold pb-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-colonial-navy">{member.name}</h1>
              <p className="font-serif text-xl text-colonial-burgundy mt-1">{member.role}</p>

              {/* Additional metadata fields if they exist */}
              <div className="mt-2 space-y-1">
                {member.state && <p className="font-serif text-sm text-colonial-navy/70">State: {member.state}</p>}
                {member.location && (
                  <p className="font-serif text-sm text-colonial-navy/70">Location: {member.location}</p>
                )}
                {member.specialization && (
                  <p className="font-serif text-sm text-colonial-navy/70">
                    Specialization: {member.specialization}
                  </p>
                )}
                {member.members && (
                  <p className="font-serif text-sm text-colonial-navy/70">Members: {member.members}</p>
                )}
                {member.established && (
                  <p className="font-serif text-sm text-colonial-navy/70">Established: {member.established}</p>
                )}
                {member.partnership_year && (
                  <p className="font-serif text-sm text-colonial-navy/70">
                    Partnership since: {member.partnership_year}
                  </p>
                )}
              </div>
            </div>

            <div
              className="content-typography"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </ContentCard>
    </PageSection>
  )
}

