import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { PostData } from "@/lib/posts";

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

export function PostRenderer({ post }: { post: PostData }) {
  const { title, date, author } = post.frontmatter;
  return (
    <article className="prose prose-invert max-w-none">
      <header className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl text-text-primary mb-4">
          {title}
        </h1>
        <div className="text-text-secondary text-sm">
          {date && <time>{new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>}
          {author && <span className="ml-4">By {author}</span>}
        </div>
      </header>
      <div className="text-text-secondary leading-relaxed">
        <MDXRemote source={post.body} options={mdxOptions} />
      </div>
    </article>
  );
}
