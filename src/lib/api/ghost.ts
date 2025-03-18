import { cache } from "./cache";

export async function ghost({
  endpoint,
  params,
}: {
  endpoint: string;
  params?: Record<string, string>;
}) {
  const url = new URL(
    `https://${process.env.GHOST_CONTENT_API_URL}/ghost/api/content/${endpoint}/?key=${process.env.GHOST_CONTENT_API_KEY}`
  );
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );
  }
  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "Accept-Version": "v5.0",
    },
    cache: "no-cache",
  });
  return await response.json();
}

export async function fetchGlobals() {
  const response = await ghost({
    endpoint: "settings",
  });
  return await response.settings;
}

export async function fetchPosts() {
  const response = await ghost({
    endpoint: "posts",
    params: {
      limit: "100",
      include: "tags,authors",
      order: "published_at%20desc",
    },
  });
  return await response.posts;
}

export async function fetchRecentPosts(limit: number) {
  const response = await ghost({
    endpoint: "posts",
    params: {
      limit: limit.toString(),
      include: "tags,authors",
    },
  });
  return await response.posts;
}

export async function fetchPages() {
  const response = await ghost({
    endpoint: "pages",
    params: {
      limit: "100",
      include: "tags,authors",
    },
  });
  return await response.pages;
}

export async function fetchPage(slug: string) {
  const response = await ghost({
    endpoint: `pages/slug/${slug}`,
    params: {
      include: "tags,authors",
    },
  });
  return await response.pages[0];
}

export async function fetchPost(slug: string) {
  const response = await ghost({
    endpoint: `posts/slug/${slug}`,
    params: {
      include: "tags,authors",
    },
  });
  return await response.posts[0];
}

export const getPages = cache(() => fetchPages(), ["pages"], {
  revalidate: 60,
});
export const getPage = cache((slug: string) => fetchPage(slug), ["page"], {
  revalidate: 60,
});
