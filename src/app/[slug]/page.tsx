import { fetchPage } from "@/lib/api/ghost";

interface PageParams {
  params: Promise<{ slug: string }>;
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
