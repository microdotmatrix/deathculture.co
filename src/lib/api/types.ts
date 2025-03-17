export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  feature_image: string;
  feature_image_alt: string;
  feature_image_caption: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  html: string;
  featured: boolean;
  visibility: string;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  authors: {
    id: string;
    name: string;
    slug: string;
  }[];
  primary_author: {
    id: string;
    name: string;
    slug: string;
    profile_image: string;
    cover_image: string;
    bio: string;
    website: string;
    location: string;
    twitter: string;
    facebook: string;
    url: string;
  };
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  feature_image: string;
  feature_image_alt: string;
  feature_image_caption: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  html: string;
  featured: boolean;
  visibility: string;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  authors: {
    id: string;
    name: string;
    slug: string;
  }[];
  primary_author: {
    id: string;
    name: string;
    slug: string;
    profile_image: string;
    cover_image: string;
    bio: string;
    website: string;
    location: string;
    twitter: string;
    facebook: string;
    url: string;
  };
}
