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

export interface Globals {
  title: string;
  description: string;
  logo: string;
  icon: string;
  accent_color: string;
  cover_image: string;
  facebook: string;
  twitter: string;
  lang: string;
  timezone: string;
  navigation: Navigation[];
  secondary_navigation: Navigation[];
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_image: string;
  twitter_title: string;
  twitter_description: string;
}

export interface Navigation {
  label: string;
  url: string;
}
