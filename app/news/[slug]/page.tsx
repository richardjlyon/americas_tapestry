import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllBlogPosts, getBlogPostBySlug, blogCategories } from "@/lib/blog"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { remark } from "remark"
import html from "remark-html"

export async function generateStaticParams() {
  const posts = getAllBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(post.content)
  const contentHtml = processedContent.toString()

  // Find the category info
  const category = blogCategories.find((cat) => cat.slug === post.category)

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
              <Link href="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Link>
            </Button>
          </div>

          <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-colonial-navy/10 max-w-4xl mx-auto">
            {post.image && (
              <div className="aspect-[16/9] relative">
                <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute top-0 right-0 bg-colonial-burgundy text-colonial-parchment text-sm font-medium px-4 py-2 rounded-bl-lg">
                  {category?.name || post.category}
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="text-sm text-colonial-navy/60 mb-3">
                {formatDate(post.date)} {post.author && `• By ${post.author}`}
              </div>

              <div
                className="content-typography"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              <div className="mt-8 pt-6 border-t border-colonial-navy/10">
                <Link
                  href={`/news/category/${post.category}`}
                  className="inline-block px-4 py-2 rounded-full bg-colonial-parchment border border-colonial-navy/20 text-colonial-navy text-sm font-medium hover:bg-colonial-navy/10 transition-colors"
                >
                  More in {category?.name || post.category}
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

