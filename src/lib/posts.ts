import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  date: string;
  summary?: string;
  author?: string;
};

export type PostData = {
  slug: string;
  frontmatter: PostFrontmatter;
  body: string;
};

export function listPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") && f !== "README.md")
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function loadPost(slug: string): PostData | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as PostFrontmatter,
    body: content,
  };
}

export function listPosts(): PostData[] {
  const slugs = listPostSlugs();
  return slugs
    .map((slug) => loadPost(slug))
    .filter((p): p is PostData => p !== null)
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1));
}
