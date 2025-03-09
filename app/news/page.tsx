import Link from "next/link"
import { BlogCard } from "@/components/blog-card"
import { getAllBlogPosts, blogCategories } from "@/lib/blog"
import { PageSection } from "@/components/ui/page-section"
import { ContentCard } from "@/components/ui/content-card"

export default function NewsPage() {
    const allPosts = getAllBlogPosts()
    const hasPosts = allPosts.length > 0

    return (
        <PageSection background="colonial-parchment">
            <h1 className="page-heading">
                News & Updates
            </h1>

            <p className="lead-text">
                Stay informed about America's Tapestry with the latest project updates, historical insights, and event
                information.
            </p>

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
                <ContentCard className="text-center max-w-2xl mx-auto">
                    <p className="font-serif text-colonial-navy/80 text-lg mb-4">
                        No blog posts have been published yet. Check back soon for updates on America's Tapestry project.
                    </p>
                    <p className="font-serif text-colonial-navy/60 text-base">
                        Our team is working on creating engaging content about our tapestry panels, historical insights, and
                        upcoming events.
                    </p>
                </ContentCard>
            )}
        </PageSection>
    )
}
