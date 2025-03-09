import { SponsorsSection } from "@/components/sponsors-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Our Sponsors | America's Tapestry",
  description:
    "Meet the organizations and institutions that make America's Tapestry possible through their generous support.",
}

export default function SponsorsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 md:pt-24">
        <SponsorsSection />
      </main>
      <Footer />
    </div>
  )
}

