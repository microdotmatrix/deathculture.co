import { fetchPost } from "@/lib/api/ghost";
import Image from "next/image";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageParams) {
  const { slug } = await params;
  const post = await fetchPost(slug);
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
        <div className="max-w-3xl my-auto">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </article>
    </main>
  );
}
