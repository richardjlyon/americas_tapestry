import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog-card"
import { FeaturedPost } from "@/components/featured-post"
import { getFeaturedBlogPosts, getLatestBlogPosts } from "@/lib/blog"

export function LatestNewsSection() {
  const featuredPosts = getFeaturedBlogPosts() || []
  const latestPosts = getLatestBlogPosts(3) || []

  // Get the first featured post, if any
  const featuredPost = featuredPosts.length > 0 ? featuredPosts[0] : null

  // Filter out the featured post from latest posts to avoid duplication
  const filteredLatestPosts = featuredPost ? latestPosts.filter((post) => post.slug !== featuredPost.slug) : latestPosts

  // Take only the posts we need
  const displayPosts = filteredLatestPosts.slice(0, featuredPost ? 2 : 3)

  // Check if we have any posts to display
  const hasPostsToDisplay = featuredPost || displayPosts.length > 0

  return (
    <section className="section-padding bg-colonial-parchment">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 tracking-tight text-center text-colonial-navy">
          Latest News
        </h2>
        <p className="font-serif text-colonial-navy mb-8 md:mb-12 text-center max-w-3xl mx-auto leading-relaxed">
          Stay updated with the latest developments, events, and insights from America's Tapestry
        </p>

        {hasPostsToDisplay ? (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-10">
                <FeaturedPost post={featuredPost} />
              </div>
            )}

            {/* Latest Posts Grid */}
            {displayPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {displayPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="font-serif text-colonial-navy/80 text-lg mb-4">
              News articles coming soon! Check back for updates on America's Tapestry project.
            </p>
          </div>
        )}

        <div className="text-center mt-10 md:mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
          >
            <Link href="/news">
              View All News <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

