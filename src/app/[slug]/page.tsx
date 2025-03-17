import { fetchPage, fetchPages } from "@/lib/api/ghost";
import type { Page } from "@/lib/api/types";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await fetchPages();
  return pages.map((page: Page) => ({
    slug: String(page.slug),
  }));
}

export default async function Page({ params }: PageParams) {
  const { slug } = await params;
  const page = await fetchPage(slug);
  return (
    <main className="flex items-stretch flex-1 flex-col">
      <header className="py-12">
        <h1>{page.title}</h1>
      </header>
      <div
        className="prose mx-auto max-w-screen-xl"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </main>
  );
}
