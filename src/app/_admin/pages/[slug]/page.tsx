import { loadPage } from "@/lib/pages";
import { notFound } from "next/navigation";
import { PageEditor } from "./PageEditor";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = loadPage(slug);
  if (!page) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit: {page.frontmatter.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Editing <code className="font-mono">content/pages/{slug}.mdx</code>
      </p>
      <PageEditor slug={slug} page={page} />
    </div>
  );
}
