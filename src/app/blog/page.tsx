import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on policy, technology, and strategy from Veritas Consulting Partners.",
};

export default function Blog() {
  const posts = listPosts();

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4">
            Blog
          </h1>
          <p className="text-text-secondary text-lg">
            Insights on policy, technology, and strategy.
          </p>
        </div>
      </section>

      {/* Posts List */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {posts.length === 0 ? (
            <div className="bg-surface border border-border p-12 text-center">
              <p className="text-text-secondary text-lg">
                No posts yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map((post) => (
                <article key={post.slug} className="border-b border-border pb-12 last:border-0">
                  <Link href={`/blog/${post.slug}`} className="group">
                    <h2 className="font-heading text-2xl sm:text-3xl text-text-primary group-hover:text-accent transition-colors mb-2">
                      {post.frontmatter.title}
                    </h2>
                    <div className="text-text-secondary text-sm mb-4">
                      {post.frontmatter.date && (
                        <time>
                          {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      )}
                      {post.frontmatter.author && (
                        <span className="ml-4">By {post.frontmatter.author}</span>
                      )}
                    </div>
                    {post.frontmatter.summary && (
                      <p className="text-text-secondary leading-relaxed">
                        {post.frontmatter.summary}
                      </p>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
