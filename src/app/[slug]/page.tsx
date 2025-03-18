import { ContactForm } from "@/components/contact";
import { fetchPage, fetchPages } from "@/lib/api/ghost";
import type { Page } from "@/lib/api/types";
import { notFound } from "next/navigation";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await fetchPages();
  return pages.map((page: Page) => ({
    slug: String(page.slug),
  }));
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) {
    return notFound();
  }
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.og_title || page.title,
      description: page.og_description || page.description,
    },
  };
}

export default async function Page({ params }: PageParams) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    return notFound();
  }

  if (page.slug === "contact-us") {
    return (
      <main className="flex items-stretch flex-1 flex-col">
        <header className="py-12">
          <h1>{page.title}</h1>
        </header>
        <section className="flex flex-col lg:flex-row gap-8 items-stretch justify-center">
          <article>
            <div
              className="prose mx-auto max-w-screen-xl"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </article>
          <aside>
            <ContactForm />
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="flex items-stretch flex-1 flex-col">
      <section className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <header className="py-12">
          <h1>{page.title}</h1>
        </header>
        <div
          className="prose max-w-none prose-img:my-0"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </section>
    </main>
  );
}
