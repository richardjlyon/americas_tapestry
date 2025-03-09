import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProjectDirector, getTeamGroups } from "@/lib/team"
import { remark } from "remark"
import html from "remark-html"
import { PageSection } from "@/components/ui/page-section"
import { ContentCard } from "@/components/ui/content-card"

export default async function TeamPage() {
    const projectDirector = getProjectDirector()
    const teamGroups = getTeamGroups()

    // Convert markdown to HTML for project director bio
    let directorBioHtml = ""
    if (projectDirector) {
        const processedContent = await remark().use(html).process(projectDirector.content)
        directorBioHtml = processedContent.toString()
    }

    // Default placeholder image if no image is found
    const directorImageSrc =
        projectDirector?.imagePath ||
        `/placeholder.svg?height=800&width=600&text=${encodeURIComponent(projectDirector?.name || "Project Director")}`

    return (
        <PageSection background="colonial-parchment">
            <h1 className="page-heading">Our Team</h1>

            {/* Project Director Feature */}
            {projectDirector && (
                <div className="mb-16 md:mb-24">
                    <ContentCard className="overflow-hidden p-0">
                        <div className="md:flex">
                            <div className="md:w-1/3 lg:w-1/4">
                                <div className="h-80 md:h-full relative">
                                    <img
                                        src={directorImageSrc || "/placeholder.svg"}
                                        alt={projectDirector.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
                                <div className="border-b border-colonial-gold pb-4 mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy">{projectDirector.name}</h2>
                                    <p className="font-serif text-xl text-colonial-burgundy mt-1">{projectDirector.role}</p>
                                </div>
                                <div
                                    className="prose prose-lg max-w-none font-serif text-colonial-navy prose-headings:font-sans prose-a:text-colonial-burgundy"
                                    dangerouslySetInnerHTML={{ __html: directorBioHtml }}
                                />
                            </div>
                        </div>
                    </ContentCard>
                </div>
            )}

            {/* Team Groups */}
            <div className="space-y-12 md:space-y-16">
                <h2 className="section-title text-center">
                    Meet Our Team Groups
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {teamGroups
                        .filter((group) => group.slug !== "project-director")
                        .map((group) => (
                            <ContentCard 
                                key={group.slug}
                                className="transition-all hover:shadow-lg p-6"
                            >
                                <h3 className="text-xl md:text-2xl font-bold text-colonial-navy mb-2">{group.name}</h3>
                                <p className="font-serif text-colonial-navy/80 mb-4">{group.description}</p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy hover:text-colonial-parchment"
                                >
                                    <Link href={`/team/${group.slug}`}>
                                        View {group.name} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </ContentCard>
                        ))}
                </div>
            </div>
        </PageSection>
    )
}
