import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tapestry } from "@/components/tapestry"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { VideoPlayer } from "@/components/video-player"
import { HeroCarousel } from "@/components/hero-carousel"
import { LatestNewsSection } from "@/components/latest-news-section"
import { getAllTapestries } from "@/lib/tapestries"
import { Divide, SignpostBig, Users2 } from "lucide-react"
import { TeamGroupsPreview } from "@/components/team-groups-preview"

export default function Home() {
    const allTapestries = getAllTapestries()

    // Filter for tapestries that have both a valid status and an image
    const eligibleTapestries = allTapestries.filter((tapestry) => {
        const hasImage = !!(tapestry.imagePath || tapestry.thumbnail);
        const isInProgress = tapestry.status !== "Not Started";

        console.log(`Tapestry ${tapestry.slug}: status=${tapestry.status}, hasImage=${hasImage}, imagePath=${tapestry.imagePath}, thumbnail=${tapestry.thumbnail}`);

        return isInProgress && hasImage;
    })

    console.log(`All tapestries count: ${allTapestries.length}`);
    console.log(`Tapestry statuses: ${allTapestries.map(t => `${t.slug}: ${t.status}`)}`);
    console.log(`Eligible tapestries count: ${eligibleTapestries.length}`);

    // Check which tapestries have images
    allTapestries.forEach(t => {
        if (t.status !== "Not Started") {
            console.log(`${t.slug} has image? ${!!(t.imagePath || t.thumbnail)}`);
        }
    });

    console.log(`Tapestries with images: ${eligibleTapestries.map(t => t.slug)}`);

    const randomTapestries = [...eligibleTapestries].sort(() => 0.5 - Math.random()).slice(0, 3)

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section with Carousel */}
                <HeroCarousel tapestries={randomTapestries} />

                {/* About Section */}
                <section id="about" className="section-padding bg-colonial-parchment">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                            <div className="content-typography">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold md:mb-6 tracking-tight text-colonial-navy">
                                    About the Project
                                </h2>
                                <p>
                                    In 2026, Americans will celebrate
                                    our country's 250th anniversary. To commemorate this occasion, <em>America's Tapestry</em> weaves
                                    together stories from our nation's founding through the medium of embroidery.
                                </p>
                                <p>
                                    Thirteen embroidered panels have been designed by our creative team in
                                    collaboration with historical organizations from each of the original colonies.
                                    Embroiderers within each state, led by our state directors, are stitching the
                                    panels over 18 months. The Tapestry will be exhibited in prominent gallery
                                    spaces in 2026 and 2027.
                                </p>
                                <p>
                                    <em>America's Tapestry</em> enriches our understanding of our shared heritage, while
                                    promoting the art of American needlework. Through our virtual and in-person
                                    programming, visitors can learn about the revolution and engage in the historic
                                    practice of needlework.
                                </p>
                            </div>
                            <div className="relative flex justify-center mt-8 md:mt-0">
                                <div className="max-w-[280px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] w-full">
                                    <VideoPlayer
                                        src="/video/250305-short-promotional/250305-short-promotional-v2-lowres.mp4"
                                        highResSrc="/video/250305-short-promotional/250305-short-promotional-v2.mp4"
                                        poster="`/video/250305-short-promotional/250305-short-promotional-v2-poster.png"
                                        className="aspect-[9/16] w-full"
                                    />
                                    <p className="font-serif text-sm sm:text-base text-colonial-navy/70 mt-2 italic text-center">
                                        Documentary excerpt: "The Making of America's Tapestry"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="section-padding bg-colonial-stone">
                    <div className="container mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-center text-colonial-navy">
                            Our Vision
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            {/* Preserve History Card */}
                            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
                                <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Divide className="h-8 w-8 text-colonial-burgundy" />
                                </div>
                                <h3 className="text-xl font-bold text-colonial-burgundy mb-4">Preserve History</h3>
                                <p className="font-serif text-colonial-navy/80 leading-relaxed">
                                    Create a lasting artistic record of America's founding that will educate and inspire future
                                    generations.
                                </p>
                            </div>

                            {/* Educate Americans Card */}
                            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
                                <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <SignpostBig className="h-8 w-8 text-colonial-burgundy" />
                                </div>
                                <h3 className="text-xl font-bold text-colonial-burgundy mb-4">Educate Americans</h3>
                                <p className="font-serif text-colonial-navy/80 leading-relaxed">
                                    Provide educational resources that bring colonial history to life through art and storytelling.
                                </p>
                            </div>

                            {/* Build Community Card */}
                            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
                                <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users2 className="h-8 w-8 text-colonial-burgundy" />
                                </div>
                                <h3 className="text-xl font-bold text-colonial-burgundy mb-4">Build Community</h3>
                                <p className="font-serif text-colonial-navy/80 leading-relaxed">
                                    Connect Americans to their shared heritage and foster appreciation for our nation's diverse origins.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tapestry Section */}
                <section id="tapestry" className="section-padding bg-colonial-parchment">
                    <div className="container mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 tracking-tight text-center text-colonial-navy">
                            The Tapestry Collection
                        </h2>
                        <p className="font-serif text-colonial-navy mb-8 md:mb-12 text-center max-w-3xl mx-auto leading-relaxed">
                            Preview a selection of our tapestries that weave together America's diverse cultural narratives
                        </p>
                        <Tapestry tapestries={randomTapestries} />
                        <div className="text-center mt-10 md:mt-12">
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
                            >
                                <Link href="/tapestries">
                                    Explore All Thirteen Colonies <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section id="team" className="section-padding bg-colonial-stone">
                    <div className="container mx-auto">
                        <TeamGroupsPreview />
                    </div>
                </section>

                {/* Latest News Section - Moved to appear after Team Section */}
                <LatestNewsSection />

                {/* Contact Section */}
                <section id="contact" className="section-padding bg-colonial-navy text-colonial-parchment">
                    <div className="container mx-auto text-center">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight">Get in Touch</h2>
                        <p className="font-serif text-colonial-parchment/90 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
                            Interested in learning more about America's Tapestry or discussing exhibition opportunities?
                        </p>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="rounded-full border-colonial-gold text-colonial-gold hover:bg-colonial-gold hover:text-colonial-navy"
                        >
                            <Link href="/contact">
                                <Mail className="mr-2 h-4 w-4" /> Contact Us
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
