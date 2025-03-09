import type React from "react"
import Link from "next/link"
import { ArrowLeft, Download, FileText, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Educational Resources | America's Tapestry",
  description: "Lesson plans, educational materials, and activities for educators about America's Tapestry",
}

interface ResourceItem {
  title: string
  description: string
  fileType: string
  fileSize: string
  icon: React.ReactNode
  downloadUrl: string
}

// Dummy data for educational resources
const lessonPlans: ResourceItem[] = [
  {
    title: "Colonial America: The Thirteen Colonies",
    description:
      "A comprehensive lesson plan for grades 6-8 exploring the formation and unique characteristics of the thirteen original colonies.",
    fileType: "PDF",
    fileSize: "2.4 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
  {
    title: "Textile Arts Through American History",
    description:
      "Hands-on activities and discussion guides for high school students examining the role of textile arts in American cultural history.",
    fileType: "PDF",
    fileSize: "3.1 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
  {
    title: "Revolutionary Symbols: Visual Literacy",
    description:
      "An elementary lesson plan focusing on identifying and understanding symbols used during the American Revolution.",
    fileType: "PDF",
    fileSize: "1.8 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
]

const activities: ResourceItem[] = [
  {
    title: "Colonial Crafts Workshop Guide",
    description:
      "Instructions for facilitating hands-on colonial crafting activities, including simple weaving techniques accessible for all ages.",
    fileType: "PDF",
    fileSize: "4.2 MB",
    icon: <PenTool className="h-6 w-6" />,
    downloadUrl: "#",
  },
  {
    title: "Virtual Museum Tour Worksheet",
    description:
      "An interactive worksheet to accompany virtual tours of colonial history exhibits, with questions and activities for students.",
    fileType: "PDF",
    fileSize: "1.5 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
  {
    title: "Tapestry Storytelling Guide",
    description:
      'A creative writing and visual arts activity that guides students in creating their own "story tapestry" based on historical events.',
    fileType: "PDF",
    fileSize: "2.3 MB",
    icon: <PenTool className="h-6 w-6" />,
    downloadUrl: "#",
  },
]

const factSheets: ResourceItem[] = [
  {
    title: "Women Textile Artists in Colonial America",
    description:
      "Historical background on the role of women in textile production during the colonial period, including notable figures and their contributions.",
    fileType: "PDF",
    fileSize: "1.2 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
  {
    title: "Evolution of American Needlework",
    description:
      "Timeline and informational guide tracing the development of American needlework traditions from colonial times to the present.",
    fileType: "PDF",
    fileSize: "2.7 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
  {
    title: "Cultural Symbolism in American Textiles",
    description:
      "An overview of recurring symbols and motifs in American textile arts and their cultural significance across different regions and time periods.",
    fileType: "PDF",
    fileSize: "1.9 MB",
    icon: <FileText className="h-6 w-6" />,
    downloadUrl: "#",
  },
]

export default function EducationalResourcesPage() {
  return (
    <main className="flex-1 pt-24 pb-16">
      <section className="bg-colonial-parchment py-12 md:py-16">
        <div className="container mx-auto">
          <div className="mb-6">
            <Button
              asChild
              variant="ghost"
              className="text-colonial-navy hover:text-colonial-burgundy hover:bg-colonial-parchment/50"
            >
              <Link href="/resources">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-colonial-navy mb-4 tracking-tight">
              Educational Resources
            </h1>
            <p className="font-serif text-colonial-navy/80 text-lg leading-relaxed">
              America's Tapestry offers a variety of educational resources designed for teachers, students, and history
              enthusiasts. These materials are crafted to complement our tapestry project and provide deeper insights
              into American colonial history, textile arts, and cultural heritage. All resources are available for free
              download and use in educational settings.
            </p>
          </div>

          <Tabs defaultValue="lesson-plans" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="lesson-plans">Lesson Plans</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="fact-sheets">Fact Sheets</TabsTrigger>
            </TabsList>

            <TabsContent value="lesson-plans" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonPlans.map((resource, index) => (
                  <ResourceCard key={index} resource={resource} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((resource, index) => (
                  <ResourceCard key={index} resource={resource} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fact-sheets" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {factSheets.map((resource, index) => (
                  <ResourceCard key={index} resource={resource} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 p-6 bg-colonial-navy/5 rounded-lg border border-colonial-navy/10 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-colonial-navy mb-3">Request Custom Resources</h2>
            <p className="font-serif text-colonial-navy/80 mb-4">
              Are you an educator looking for specific materials related to America's Tapestry? We can develop custom
              resources tailored to your curriculum needs. Please contact our educational outreach team.
            </p>
            <Button asChild className="rounded-full bg-colonial-burgundy hover:bg-colonial-burgundy/90">
              <Link href="/contact?subject=Educational%20Resources%20Request">Contact Educational Outreach</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  return (
    <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
      <CardHeader>
        <div className="w-10 h-10 rounded-full bg-colonial-burgundy/10 flex items-center justify-center mb-3">
          {resource.icon}
        </div>
        <CardTitle className="text-lg text-colonial-navy">{resource.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-serif text-colonial-navy/80 text-sm mb-4">{resource.description}</p>
        <div className="flex items-center text-sm text-colonial-navy/60">
          <span className="font-medium">{resource.fileType}</span>
          <span className="mx-2">•</span>
          <span>{resource.fileSize}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant="outline"
          className="w-full border-colonial-burgundy text-colonial-burgundy hover:bg-colonial-burgundy/10"
        >
          <Link href={resource.downloadUrl}>
            <Download className="mr-2 h-4 w-4" /> Download Resource
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

