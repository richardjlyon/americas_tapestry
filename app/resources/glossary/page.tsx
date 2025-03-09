import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Tapestry Glossaries | America's Tapestry",
  description: "Detailed explanations of traditional tapestry-making techniques and methods",
}

interface GlossaryTerm {
  term: string
  definition: string
  category: "stitches" | "materials" | "tools" | "techniques"
}

// Dummy data for glossary terms
const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Crewel Embroidery",
    definition:
      "A technique of surface embroidery using wool thread on a linen or cotton foundation fabric. Dating back to medieval England, crewel embroidery was particularly popular in colonial America for decorative household items and clothing.",
    category: "techniques",
  },
  {
    term: "Stem Stitch",
    definition:
      "A basic embroidery stitch used to outline shapes and create fine lines. The stitches overlap slightly to form a twisted rope-like line. This stitch was commonly used in colonial American samplers and embroidered pieces.",
    category: "stitches",
  },
  {
    term: "Long and Short Stitch",
    definition:
      "A filling stitch used to create shaded or graduated color areas in embroidery. It consists of alternating long and short stitches that blend colors together, creating a painterly effect.",
    category: "stitches",
  },
  {
    term: "Merino Wool",
    definition:
      "A fine, soft wool from Merino sheep, known for its elasticity and excellent color absorption when dyed. Used in high-quality embroidery and tapestry work where detail and texture are important.",
    category: "materials",
  },
  {
    term: "Linen Ground Cloth",
    definition:
      "The base fabric used in many traditional tapestries and embroideries. Made from flax fibers, linen provides a sturdy yet flexible foundation with a distinctive texture that was widely available in colonial America.",
    category: "materials",
  },
  {
    term: "Embroidery Frame",
    definition:
      "A device used to hold fabric taut while stitching, allowing for more precise needlework. Colonial frames were often wooden hoops or rectangular frames that could be placed on a stand or held in the lap.",
    category: "tools",
  },
  {
    term: "Tapestry Needle",
    definition:
      "A blunt-tipped needle with a large eye designed specifically for tapestry work. The blunt tip prevents splitting the ground fabric threads, while the large eye accommodates thicker yarns and threads.",
    category: "tools",
  },
  {
    term: "Couching",
    definition:
      "A technique where threads are laid on the surface of the fabric and secured with small stitches. This method was often used to create raised elements or to incorporate metallic threads that were too thick to pass through the fabric.",
    category: "techniques",
  },
]

export default function GlossaryPage() {
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

          <div className="max-w-3xl mx-auto mb-12 content-typography">
            <h1 className="text-3xl md:text-4xl font-bold text-colonial-navy mb-4 tracking-tight">
              Tapestry Glossaries
            </h1>
            <p>
              Explore the terminology and techniques used in traditional tapestry making. Our comprehensive glossaries
              provide detailed explanations of stitching methods, materials, tools, and specialized terminology used
              throughout the America's Tapestry project.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-colonial-navy/50 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search glossary terms..."
                className="pl-10 bg-white border-colonial-navy/20 focus-visible:ring-colonial-burgundy"
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-8">
                <TabsTrigger value="all">All Terms</TabsTrigger>
                <TabsTrigger value="stitches">Stitches</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="techniques">Techniques</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {glossaryTerms
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term, index) => (
                      <GlossaryCard key={index} term={term} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="stitches" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {glossaryTerms
                    .filter((term) => term.category === "stitches")
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term, index) => (
                      <GlossaryCard key={index} term={term} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {glossaryTerms
                    .filter((term) => term.category === "materials")
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term, index) => (
                      <GlossaryCard key={index} term={term} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="tools" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {glossaryTerms
                    .filter((term) => term.category === "tools")
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term, index) => (
                      <GlossaryCard key={index} term={term} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="techniques" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {glossaryTerms
                    .filter((term) => term.category === "techniques")
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term, index) => (
                      <GlossaryCard key={index} term={term} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-12 p-6 bg-colonial-navy/5 rounded-lg border border-colonial-navy/10 max-w-3xl mx-auto content-typography">
            <h2 className="text-xl font-bold text-colonial-navy mb-3">Download Complete Glossary</h2>
            <p>
              Want a reference you can keep? Download our complete illustrated glossary of tapestry terms, techniques,
              and tools as a PDF for convenient reference.
            </p>
            <Button asChild className="rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90">
              <Link href="#">Download Complete Glossary (PDF, 8.3MB)</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function GlossaryCard({ term }: { term: GlossaryTerm }) {
  const categoryColors = {
    stitches: "bg-colonial-burgundy/10 text-colonial-burgundy",
    materials: "bg-colonial-gold/10 text-colonial-gold",
    tools: "bg-colonial-navy/10 text-colonial-navy",
    techniques: "bg-green-100 text-green-800",
  }

  return (
    <div className="bg-white shadow-sm border border-colonial-navy/10 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-colonial-navy text-lg">{term.term}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex ${categoryColors[term.category]}`}>
          {term.category.charAt(0).toUpperCase() + term.category.slice(1)}
        </div>
      </div>
      <div className="content-typography">
        <p>{term.definition}</p>
      </div>
    </div>
  )
}

