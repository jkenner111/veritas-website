import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { listPostSlugs, loadPost } from "@/lib/posts";
import { PostRenderer } from "@/components/PostRenderer";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return listPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPost(slug);
  return {
    title: post?.frontmatter.title || "Blog Post",
    description: post?.frontmatter.summary,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = loadPost(slug);
  
  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog" 
            className="text-text-secondary hover:text-accent transition-colors text-sm"
          >
            ← Back to Blog
          </Link>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <PostRenderer post={post} />
        </div>
      </section>
    </>
  );
}
