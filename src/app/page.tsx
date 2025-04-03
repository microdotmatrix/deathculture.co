import { fetchGlobals, fetchPage, fetchRecentPosts } from "@/lib/api/ghost";
import type { ContentProps } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default async function Home() {
  const globals = await fetchGlobals();
  const page = await fetchPage("home");
  return (
    <main>
      <section className="relative h-[90svh]">
        <Image
          src={page.feature_image}
          alt={page.title}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 to-transparent" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">{globals.title}</h1>
        </div>
      </section>
      <section>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </section>
      <div className="px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <RecentPosts />
        </Suspense>
      </div>
    </main>
  );
}

async function RecentPosts() {
  const posts = await fetchRecentPosts(3);
  return (
    <div className="flex flex-row items-stretch justify-between gap-4">
      {posts.map((post: ContentProps) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-stretch"
        >
          <Link
            href={`/posts/${post.slug}`}
            className="relative aspect-video h-[480px]"
          >
            <Image
              src={post.feature_image}
              alt={post.feature_image_alt || post.title}
              fill
              className="object-cover"
            />
          </Link>
          <div className="p-4 flex flex-col justify-between gap-4">
            <h2 className="text-xl font-bold mb-2">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-gray-600 text-sm mb-2">{post.excerpt}...</p>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{post.primary_author.name}</span>
              <span className="text-gray-600">
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
