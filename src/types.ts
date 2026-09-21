export interface Accessory {
  id: string;
  refCode: string;
  name: string;
  category: 'rings' | 'bracelets' | 'necklaces' | 'earrings' | 'accents';
  categoryLabel: string;
  tagline: string;
  description: string;
  craftsmanship: string;
  materials: string[];
  dimensions: string;
  stylingNote: string;
  image: string;
  altImage?: string;
  badge?: string;
  featuredInEveryday?: boolean;
}

export interface CollectionSpotlight {
  id: string;
  title: string;
  subtitle: string;
  category: 'rings' | 'bracelets' | 'necklaces' | 'earrings' | 'accents';
  image: string;
  actionText: string;
  span?: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
}
