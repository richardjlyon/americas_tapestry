import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog-card"
import { getAllBlogPosts, blogCategories } from "@/lib/blog"

export default function NewsPage() {
  const allPosts = getAllBlogPosts()
  const hasPosts = allPosts.length > 0

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
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-colonial-navy mb-6 text-center">
            News & Updates
          </h1>

          <div className="max-w-3xl mx-auto mb-12 text-center">
            <p className="font-serif text-colonial-navy text-lg md:text-xl leading-relaxed">
              Stay informed about America's Tapestry with the latest project updates, historical insights, and event
              information.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Link
              href="/news"
              className="inline-block px-4 py-2 rounded-full bg-colonial-navy text-colonial-parchment text-sm font-medium"
            >
              All Categories
            </Link>
            {blogCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/news/category/${category.slug}`}
                className="inline-block px-4 py-2 rounded-full bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy text-sm font-medium hover:bg-colonial-navy/10 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Blog Posts Grid */}
          {hasPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
              <p className="font-serif text-colonial-navy/80 text-lg mb-4">
                No blog posts have been published yet. Check back soon for updates on America's Tapestry project.
              </p>
              <p className="font-serif text-colonial-navy/60 text-base">
                Our team is working on creating engaging content about our tapestry panels, historical insights, and
                upcoming events.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

