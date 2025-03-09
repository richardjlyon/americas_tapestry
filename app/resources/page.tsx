import Link from "next/link"
import { ArrowRight, BookOpen, History, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSection } from "@/components/ui/page-section"

export const metadata = {
    title: "Resources | America's Tapestry",
    description: "Educational resources, glossaries, and artefact galleries related to America's Tapestry project",
}

export default function ResourcesPage() {
    return (
        <PageSection background="colonial-parchment">
            <h1 className="page-heading">
                Resources
            </h1>
            
            <p className="lead-text">
                Explore our collection of educational materials, technical glossaries, and historical artefacts that
                complement and enhance your understanding of America's Tapestry project.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Educational Resources Card */}
                <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="w-12 h-12 rounded-full bg-colonial-burgundy/10 flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6 text-colonial-burgundy" />
                        </div>
                        <CardTitle className="text-xl text-colonial-navy">Educational Resources</CardTitle>
                        <CardDescription className="text-colonial-navy/70">
                            Teaching materials and activities for educators
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="font-serif text-colonial-navy/80">
                            Access lesson plans, educational materials, historical fact sheets, and interactive activities
                            designed for educators at all levels. Our resources are aligned with curriculum standards and cover
                            various aspects of American history and textile arts.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full rounded-full bg-colonial-burgundy hover:bg-colonial-burgundy/90">
                            <Link href="/resources/educational">
                                Explore Resources <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Tapestry Glossaries Card */}
                <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="w-12 h-12 rounded-full bg-colonial-gold/10 flex items-center justify-center mb-4">
                            <Gauge className="h-6 w-6 text-colonial-gold" />
                        </div>
                        <CardTitle className="text-xl text-colonial-navy">Tapestry Glossaries</CardTitle>
                        <CardDescription className="text-colonial-navy/70">
                            Technical terms and traditional methods
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="font-serif text-colonial-navy/80">
                            Discover the rich vocabulary and techniques used in traditional tapestry making. Our glossaries
                            provide detailed explanations of stitching methods, materials, tools, and specialized terminology used
                            throughout the America's Tapestry project.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            asChild
                            className="w-full rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90"
                        >
                            <Link href="/resources/glossary">
                                View Glossaries <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Related Artefacts Gallery Card */}
                <Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="w-12 h-12 rounded-full bg-colonial-navy/10 flex items-center justify-center mb-4">
                            <History className="h-6 w-6 text-colonial-navy" />
                        </div>
                        <CardTitle className="text-xl text-colonial-navy">Related Artefacts Gallery</CardTitle>
                        <CardDescription className="text-colonial-navy/70">Historical items and inspirations</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="font-serif text-colonial-navy/80">
                            Explore a curated collection of historical items and artefacts that inspired or are thematically
                            connected to the America's Tapestry project. Each item is presented with historical context and its
                            relationship to our tapestry panels.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full rounded-full bg-colonial-navy hover:bg-colonial-navy/90">
                            <Link href="/resources/artefacts">
                                Browse Gallery <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </PageSection>
    )
}
