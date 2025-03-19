import { Content } from "@/components/ghost/content";
import { fetchPost, fetchPosts } from "@/lib/api/ghost";
import { Post } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post: Post) => ({
    slug: String(post.slug),
  }));
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) {
    return notFound();
  }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
    },
  };
}

export default async function PostPage({ params }: PageParams) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) {
    return notFound();
  }
  return (
    <main className="flex items-stretch flex-1">
      <aside className="relative min-h-svh w-full flex-2">
        <Image
          src={post.feature_image}
          alt={post.feature_image_alt || post.title}
          fill
          className="object-cover size-full"
          priority
        />
      </aside>
      <article className="flex-3 px-12 flex flex-col justify-center">
        <div className="max-w-3xl my-auto py-12 lg:py-20">
          <header className="mb-8 border-b">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-500">
                Posted by: {post.primary_author?.name}
              </p>
              <p className="text-gray-500">{formatDate(post.created_at)}</p>
            </div>
          </header>
          <Content data={post.html} />
        </div>
      </article>
    </main>
  );
}
