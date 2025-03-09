import Link from "next/link"
import { ArrowLeft, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTapestryBySlug, getAllTapestries } from "@/lib/tapestries"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import { remark } from "remark"
import html from "remark-html"
import { AccessibleAudioPlayer } from "@/components/accessible-audio-player"

// Status color mapping
const statusColors = {
  "Not Started": "bg-colonial-navy/70",
  Designed: "bg-indigo-500",
  "In Production": "bg-colonial-burgundy",
  Finished: "bg-colonial-gold",
}

const statusTextColors = {
  "Not Started": "text-colonial-parchment",
  Designed: "text-colonial-parchment",
  "In Production": "text-colonial-parchment",
  Finished: "text-colonial-navy",
}

export async function generateStaticParams() {
  const tapestries = getAllTapestries()

  return tapestries.map((tapestry) => ({
    slug: tapestry.slug,
  }))
}

export default async function TapestryPage({ params }: { params: { slug: string } }) {
  const tapestry = getTapestryBySlug(params.slug)

  if (!tapestry) {
    notFound()
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(tapestry.content)
  const contentHtml = processedContent.toString()

  const statusColor = statusColors[tapestry.status] || "bg-colonial-navy/70"
  const statusTextColor = statusTextColors[tapestry.status] || "text-colonial-parchment"

  return (
    <main className="min-h-screen">
      <section className={cn("min-h-screen", tapestry.background_color || "bg-colonial-parchment")}>
        <div className="container pt-16 md:pt-20 pb-16 md:pb-20">
          <div className="py-6">
            <Button
              asChild
              variant="ghost"
              className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
            >
              <Link href="/tapestries">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Collection
              </Link>
            </Button>
          </div>

          <div className="bg-colonial-parchment rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-[16/9] w-full relative">
              <img
                src={tapestry.imagePath || tapestry.thumbnail || "/placeholder.svg?height=600&width=800"}
                alt={tapestry.title}
                className="w-full h-full object-cover"
              />

              {tapestry.audioPath && (
                <div className="absolute bottom-4 right-4">
                  <div className="bg-colonial-navy/80 text-colonial-parchment rounded-full p-2 shadow-md">
                    <Headphones className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Audio description available</span>
                  </div>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-4 left-4">
                <div className={`${statusColor} ${statusTextColor} px-3 py-1 rounded-full shadow-md font-medium`}>
                  Status: {tapestry.status}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-colonial-navy mb-4">{tapestry.title}</h1>
              <p className="font-serif text-xl text-colonial-navy/80 mb-8">{tapestry.summary}</p>

              {tapestry.audioPath && (
                <div className="mb-8">
                  <AccessibleAudioPlayer
                    src={tapestry.audioPath}
                    title={`Audio Description: ${tapestry.title} Tapestry`}
                    description={tapestry.audioDescription}
                  />
                </div>
              )}

              <div
                className="content-typography"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

