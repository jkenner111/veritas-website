import { tool } from "ai";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");
const PUBLIC_IMAGES_ROOT = path.resolve(process.cwd(), "public", "images");
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "/app/data/uploads";

function safeContentPath(requested: string): string | null {
  const full = path.resolve(CONTENT_ROOT, requested);
  if (full !== CONTENT_ROOT && !full.startsWith(CONTENT_ROOT + path.sep)) {
    return null;
  }
  return full;
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const agentTools = {
  list_pages: tool({
    description:
      "List all MDX pages under content/pages/ with slug and title.",
    inputSchema: z.object({}),
    execute: async () => {
      const dir = path.join(CONTENT_ROOT, "pages");
      if (!fs.existsSync(dir)) return [];
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
      return files.map((f) => {
        const raw = fs.readFileSync(path.join(dir, f), "utf-8");
        const { data } = matter(raw);
        return {
          slug: f.replace(/\.mdx$/, ""),
          path: `pages/${f}`,
          title: data.title ?? null,
        };
      });
    },
  }),

  list_posts: tool({
    description:
      "List all blog posts under content/blog/ with slug, title, date, and author.",
    inputSchema: z.object({}),
    execute: async () => {
      const dir = path.join(CONTENT_ROOT, "blog");
      if (!fs.existsSync(dir)) return [];
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
      return files
        .map((f) => {
          const raw = fs.readFileSync(path.join(dir, f), "utf-8");
          const { data } = matter(raw);
          return {
            slug: f.replace(/\.mdx$/, ""),
            path: `blog/${f}`,
            title: data.title ?? null,
            date: data.date ?? null,
            author: data.author ?? null,
          };
        })
        .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
    },
  }),

  read_file: tool({
    description:
      "Read a file under content/. Path must be relative to content/ root. Returns raw MDX including frontmatter.",
    inputSchema: z.object({
      path: z
        .string()
        .describe(
          "Path relative to content/. Examples: \"pages/about.mdx\", \"blog/welcome.mdx\", \"navigation.json\".",
        ),
    }),
    execute: async ({ path: requested }) => {
      const full = safeContentPath(requested);
      if (!full) {
        return { error: "Path escapes content/ root. Refused." };
      }
      if (!fs.existsSync(full)) {
        return { error: `File not found: ${requested}` };
      }
      const raw = fs.readFileSync(full, "utf-8");
      return { path: requested, content: raw };
    },
  }),

  list_navigation: tool({
    description: "Return the site navigation menu from content/navigation.json.",
    inputSchema: z.object({}),
    execute: async () => {
      const file = path.join(CONTENT_ROOT, "navigation.json");
      const raw = fs.readFileSync(file, "utf-8");
      return JSON.parse(raw);
    },
  }),

  create_page: tool({
    description:
      "Create a new MDX page in content/pages/. Returns the created file path.",
    inputSchema: z.object({
      slug: z
        .string()
        .describe("URL-friendly slug for the page. Example: \"about\" or \"services\""),
      title: z
        .string()
        .describe("Page title. Example: \"About Us\""),
      body: z
        .string()
        .describe("Page content in MDX/markdown."),
    }),
    execute: async ({ slug, title, body }) => {
      const cleanSlug = sanitizeSlug(slug);
      const filename = `${cleanSlug}.mdx`;
      const filepath = path.join(CONTENT_ROOT, "pages", filename);

      if (fs.existsSync(filepath)) {
        return { error: `Page already exists: pages/${filename}. Use update_page instead.` };
      }

      const frontmatter = {
        title,
        lastUpdated: new Date().toISOString(),
      };

      const mdxContent = matter.stringify(body, frontmatter);
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, mdxContent, "utf-8");

      return {
        success: true,
        path: `pages/${filename}`,
        message: `Created page "${title}" at /pages/${cleanSlug}`,
      };
    },
  }),

  create_post: tool({
    description:
      "Create a new blog post in content/blog/. Returns the created file path.",
    inputSchema: z.object({
      title: z
        .string()
        .describe("Blog post title. Example: \"AI Strategy for Federal Agencies\""),
      date: z
        .string()
        .describe("Publication date in YYYY-MM-DD format. Example: \"2026-05-28\""),
      summary: z
        .string()
        .optional()
        .describe("Brief summary for the blog index listing."),
      author: z
        .string()
        .optional()
        .describe("Author name. Example: \"Jack Kenner\""),
      body: z
        .string()
        .describe("Blog post content in MDX/markdown."),
    }),
    execute: async ({ title, date, summary, author, body }) => {
      const slug = sanitizeSlug(title);
      const filename = `${slug}.mdx`;
      const filepath = path.join(CONTENT_ROOT, "blog", filename);

      if (fs.existsSync(filepath)) {
        return { error: `Blog post already exists: blog/${filename}. Use update_post instead.` };
      }

      const frontmatter: Record<string, string> = { title, date };
      if (summary) frontmatter.summary = summary;
      if (author) frontmatter.author = author;

      const mdxContent = matter.stringify(body, frontmatter);
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, mdxContent, "utf-8");

      return {
        success: true,
        path: `blog/${filename}`,
        message: `Created blog post "${title}"`,
      };
    },
  }),

  update_page: tool({
    description:
      "Update an MDX page in content/pages/. Replaces the page body content.",
    inputSchema: z.object({
      path: z
        .string()
        .describe("Path to page file relative to content/. Example: \"pages/about.mdx\""),
      title: z.string().optional().describe("New page title (in frontmatter)"),
      body: z
        .string()
        .describe("New page body in MDX/markdown. This REPLACES the entire page content."),
    }),
    execute: async ({ path: requested, title, body }) => {
      const full = safeContentPath(requested);
      if (!full) return { error: "Path escapes content/ root. Refused." };
      if (!fs.existsSync(full)) return { error: `File not found: ${requested}` };

      const raw = fs.readFileSync(full, "utf-8");
      const { data: existingData } = matter(raw);

      const newData = { ...existingData };
      if (title) newData.title = title;
      newData.lastUpdated = new Date().toISOString();

      const mdxContent = matter.stringify(body, newData);
      fs.writeFileSync(full, mdxContent, "utf-8");

      return { success: true, path: requested, message: `Updated page "${newData.title}"` };
    },
  }),

  update_post: tool({
    description:
      "Update an existing blog post in content/blog/. Can change title, date, summary, author, and body.",
    inputSchema: z.object({
      path: z
        .string()
        .describe("Path to blog post relative to content/. Example: \"blog/welcome.mdx\""),
      title: z.string().optional().describe("New title"),
      date: z.string().optional().describe("New date in YYYY-MM-DD format"),
      summary: z.string().optional().describe("New summary"),
      author: z.string().optional().describe("New author"),
      body: z.string().optional().describe("New body content in MDX/markdown"),
    }),
    execute: async ({ path: requested, title, date, summary, author, body }) => {
      const full = safeContentPath(requested);
      if (!full) return { error: "Path escapes content/ root. Refused." };
      if (!fs.existsSync(full)) return { error: `File not found: ${requested}` };

      const raw = fs.readFileSync(full, "utf-8");
      const { data: existingData, content: existingBody } = matter(raw);

      const newData = { ...existingData };
      if (title) newData.title = title;
      if (date) newData.date = date;
      if (summary !== undefined) newData.summary = summary;
      if (author !== undefined) newData.author = author;

      const newBody = body !== undefined ? body : existingBody;
      const mdxContent = matter.stringify(newBody, newData);
      fs.writeFileSync(full, mdxContent, "utf-8");

      return { success: true, path: requested, message: `Updated blog post "${newData.title}"` };
    },
  }),

  delete_page: tool({
    description:
      "Delete a page from content/pages/. CONFIRM with the user before calling. Also remove any navigation link to the deleted page.",
    inputSchema: z.object({
      path: z
        .string()
        .describe("Path to the page file relative to content/. Example: \"pages/old-page.mdx\""),
    }),
    execute: async ({ path: requested }) => {
      const full = safeContentPath(requested);
      if (!full) return { error: "Path escapes content/ root. Refused." };
      if (!requested.startsWith("pages/")) return { error: "delete_page can only remove files in content/pages/" };
      if (!fs.existsSync(full)) return { error: `File not found: ${requested}` };
      fs.unlinkSync(full);
      return { success: true, path: requested, message: `Deleted page ${requested}` };
    },
  }),

  delete_post: tool({
    description:
      "Delete a blog post from content/blog/. CONFIRM with the user before calling. Deletion is permanent until the next Revert.",
    inputSchema: z.object({
      path: z
        .string()
        .describe("Path to blog post relative to content/. Example: \"blog/old-post.mdx\""),
    }),
    execute: async ({ path: requested }) => {
      const full = safeContentPath(requested);
      if (!full) return { error: "Path escapes content/ root. Refused." };
      if (!requested.startsWith("blog/")) return { error: "delete_post can only remove files in content/blog/" };
      if (!fs.existsSync(full)) return { error: `File not found: ${requested}` };
      fs.unlinkSync(full);
      return { success: true, path: requested, message: `Deleted blog post ${requested}` };
    },
  }),

  attach_image: tool({
    description:
      "Move an uploaded image from the uploads area into public/images/ so it can be referenced in pages. Returns the public path that can be embedded in markdown as ![alt](publicPath).",
    inputSchema: z.object({
      uploadStoredName: z
        .string()
        .describe("The stored filename of the upload. Example: \"2026-05-28T22-30-00-000Z-jkenner-abc12345.jpg\""),
      destFilename: z
        .string()
        .describe("Filename to use in public/images/. Lowercase, kebab-case, keep the extension. Example: \"team-photo.jpg\"."),
    }),
    execute: async ({ uploadStoredName, destFilename }) => {
      const storedBase = path.basename(uploadStoredName);
      const src = path.join(UPLOADS_DIR, storedBase);
      if (!fs.existsSync(src)) return { error: `Upload not found: ${storedBase}` };

      const safeDest = path.basename(destFilename).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(safeDest)) {
        return { error: "destFilename must end in .jpg, .jpeg, .png, .gif, or .webp" };
      }

      const dst = path.join(PUBLIC_IMAGES_ROOT, safeDest);
      if (!dst.startsWith(PUBLIC_IMAGES_ROOT + path.sep)) return { error: "Destination escapes public/images/. Refused." };
      if (fs.existsSync(dst)) return { error: `An image already exists at images/${safeDest}. Pick a different filename.` };

      fs.mkdirSync(PUBLIC_IMAGES_ROOT, { recursive: true });
      fs.copyFileSync(src, dst);

      const publicPath = `/images/${safeDest}`;
      return {
        success: true,
        publicPath,
        markdown: `![](${publicPath})`,
        message: `Image saved to public/images/${safeDest}. Reference it as ${publicPath} or embed with ![alt text](${publicPath}).`,
      };
    },
  }),

  delete_image: tool({
    description:
      "Delete an image from public/images/. CONFIRM with the user before calling. Note: this does NOT remove references to the image from page bodies; warn the user to also edit any page that displays it.",
    inputSchema: z.object({
      filename: z
        .string()
        .describe("Filename only (no path components). Example: \"team-photo.jpg\"."),
    }),
    execute: async ({ filename }) => {
      const safeName = path.basename(filename);
      if (safeName !== filename) return { error: "Provide a filename only, not a path." };
      const full = path.join(PUBLIC_IMAGES_ROOT, safeName);
      if (!full.startsWith(PUBLIC_IMAGES_ROOT + path.sep)) return { error: "Destination escapes public/images/. Refused." };
      if (!fs.existsSync(full)) return { error: `Image not found: public/images/${safeName}` };
      fs.unlinkSync(full);
      return {
        success: true,
        message: `Deleted public/images/${safeName}. If any page referenced this image, update those pages too.`,
      };
    },
  }),

  update_navigation: tool({
    description:
      "Update the site navigation menu in content/navigation.json. Use this to add, remove, or reorder menu items.",
    inputSchema: z.object({
      action: z
        .enum(["add", "remove", "reorder"])
        .describe("Action to perform on navigation"),
      label: z
        .string()
        .optional()
        .describe("Navigation item label (required for add/remove)"),
      href: z
        .string()
        .optional()
        .describe("Navigation item URL (required for add). Example: \"/blog\""),
      position: z
        .number()
        .optional()
        .describe("Position in menu (0-based, required for reorder)"),
    }),
    execute: async ({ action, label, href, position }) => {
      const navPath = path.join(CONTENT_ROOT, "navigation.json");
      const raw = fs.readFileSync(navPath, "utf-8");
      const nav: Array<{ href: string; label: string }> = JSON.parse(raw);

      if (action === "add") {
        if (!label || !href) return { error: "label and href are required for add action" };
        if (nav.some((item) => item.href === href)) return { error: `Navigation item with href "${href}" already exists` };
        nav.push({ label, href });
      } else if (action === "remove") {
        if (!label) return { error: "label is required for remove action" };
        const index = nav.findIndex((item) => item.label === label);
        if (index === -1) return { error: `Navigation item "${label}" not found` };
        nav.splice(index, 1);
      } else if (action === "reorder") {
        if (!label || position === undefined) return { error: "label and position are required for reorder action" };
        const index = nav.findIndex((item) => item.label === label);
        if (index === -1) return { error: `Navigation item "${label}" not found` };
        const [item] = nav.splice(index, 1);
        nav.splice(position, 0, item);
      }

      fs.writeFileSync(navPath, JSON.stringify(nav, null, 2) + "\n", "utf-8");
      return { success: true, message: `Navigation ${action}ed successfully`, navigation: nav };
    },
  }),
};
