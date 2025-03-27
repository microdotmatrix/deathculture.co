export interface ContentProps {
  id: string;
  uuid: string;
  slug: string;
  title: string;
  excerpt: string;
  custom_excerpt: string;
  feature_image: string;
  feature_image_alt: string;
  feature_image_caption: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  html: string;
  featured: boolean;
  visibility: string;
  custom_template: string;
  tags: TagProps[];
  authors: AuthorProps[];
  primary_author: AuthorProps;
  primary_tag: TagProps;
}

export interface TagProps {
  slug: string;
  id: string;
  name: string;
  description: string;
  feature_image: string;
  visibility: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  og_title: string;
  og_description: string;
  twitter_image: string;
  twitter_title: string;
  twitter_description: string;
  codeinjection_head: string;
  codeinjection_foot: string;
  canonical_url: string;
  accent_color: string;
  url: string;
}

export interface AuthorProps {
  slug: string;
  id: string;
  name: string;
  profile_image: string;
  cover_image: string;
  bio: string;
  website: string;
  location: string;
  facebook: string;
  twitter: string;
  meta_title: string;
  meta_description: string;
  url: string;
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
  navigation: NavigationProps[];
  secondary_navigation: NavigationProps[];
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_image: string;
  twitter_title: string;
  twitter_description: string;
}

export interface NavigationProps {
  label: string;
  url: string;
}
