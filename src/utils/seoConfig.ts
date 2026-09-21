/**
 * SIGNORA BLOOM — Centralized SEO & Structured Data Configuration
 * 
 * Strict Guidelines:
 * - Business showcase / brand website for imported women's accessories and jewelry
 * - No ecommerce checkout, no fake prices, no fake reviews, no merchant feeds
 * - Single source of truth for canonical production domain (SITE_URL)
 */

export const DEFAULT_SITE_URL = 'https://signorabloom.com';

/**
 * Returns the canonical production domain.
 * Honors environment variable SITE_URL or VITE_SITE_URL if configured,
 * otherwise falls back cleanly to the official production domain.
 * Prevents temporary preview domains or localhost from becoming canonical.
 */
export function getSiteUrl(): string {
  // 1. Environment variable check
  const envUrl =
    (typeof process !== 'undefined' && process.env && (process.env.SITE_URL || process.env.APP_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_SITE_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    // Ignore internal dev/localhost strings in production builds
    if (!cleanUrl.includes('localhost') && !cleanUrl.includes('127.0.0.1')) {
      return cleanUrl;
    }
  }

  // 2. Browser check: use origin only if running on a real custom domain (not localhost or preview runners)
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1') &&
      !origin.includes('.run.app') &&
      !origin.includes('vercel.app')
    ) {
      return origin.replace(/\/+$/, '');
    }
  }

  return DEFAULT_SITE_URL;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
}

export const SEO_PAGES: Record<string, SeoMetadata> = {
  home: {
    title: "Signora Bloom - A Curated Collection of Everyday Elegance",
    description: "Discover Signora Bloom, a curated collection of women's jewelry and fashion accessories designed to bring effortless elegance to everyday style.",
    canonicalPath: '/',
    ogType: 'website',
    ogImage: '/assets/images/jewelry_hero_clean_1_1789492829951.jpg',
    ogImageAlt: "Signora Bloom Curated Women's Jewelry and Everyday Fashion Accessories",
  },
  collections: {
    title: "Women's Jewelry & Accessories Collections | Signora Bloom",
    description: "Explore curated collections from Signora Bloom, including fine rings, sculptural bangles, layered bracelets, fluted hoop earrings, and everyday fashion jewelry.",
    canonicalPath: '/#collections',
    ogType: 'website',
    ogImage: '/assets/images/shop_bracelets_square_1789491269438.jpg',
    ogImageAlt: "Signora Bloom Women's Bangles, Bracelets, and Jewelry Collections",
  },
  rings: {
    title: "Women's Rings | Signora Bloom",
    description: "Discover feminine statement rings and delicate designs from Signora Bloom, thoughtfully curated to bring refined elegance to your everyday look.",
    canonicalPath: '/#collections',
    ogType: 'website',
  },
  bracelets: {
    title: "Women's Bangles & Bracelets | Signora Bloom",
    description: "Browse beautifully sculpted bangles and layered bracelets from Signora Bloom, designed for stacking, layering, and effortless everyday wear.",
    canonicalPath: '/#collections',
    ogType: 'website',
  },
  earrings: {
    title: "Women's Earrings | Signora Bloom",
    description: "Elevate your daily outfits with elegant earrings from Signora Bloom, featuring ribbed hoops, textured studs, and delicate drop designs.",
    canonicalPath: '/#collections',
    ogType: 'website',
  },
  jewelry: {
    title: "Women's Jewelry | Signora Bloom",
    description: "Explore Signora Bloom's curated women's jewelry selection, featuring embossed coin medallions, delicate chain accents, and timeless daily pieces.",
    canonicalPath: '/#collections',
    ogType: 'website',
  },
  accessories: {
    title: "Women's Fashion Accessories | Signora Bloom",
    description: "Discover curated women's accessories from Signora Bloom, chosen to bring personality, polish, and timeless character to every outfit.",
    canonicalPath: '/#collections',
    ogType: 'website',
  },
  elegance: {
    title: "Everyday Elegance Collection | Signora Bloom",
    description: "Browse Signora Bloom's Everyday Elegance showcase, featuring versatile accessories and jewelry crafted for refined daily wear.",
    canonicalPath: '/#everyday-elegance',
    ogType: 'website',
  },
  about: {
    title: "About Signora Bloom | Women's Accessories & Jewelry",
    description: "Learn about Signora Bloom, a curated boutique brand offering imported women's accessories and timeless jewelry designed for effortless modern elegance.",
    canonicalPath: '/#about',
    ogType: 'article',
  },
  gift: {
    title: "Why Signora Bloom & Curated Gift Packaging | Signora Bloom",
    description: "Experience Signora Bloom's signature luxury packaging and thoughtful curation, crafted to make every surprise and gift feel truly unforgettable.",
    canonicalPath: '/#surprise-loved-one',
    ogType: 'website',
  },
  admin: {
    title: "Atelier CMS | Signora Bloom",
    description: "Private administrative management portal for Signora Bloom Atelier.",
    canonicalPath: '/',
    noindex: true,
  },
  notFound: {
    title: "Page Not Found | Signora Bloom",
    description: "The page you are looking for does not exist. Return to Signora Bloom to discover our curated collection of women's jewelry and fashion accessories.",
    canonicalPath: '/404',
    noindex: true,
  },
};

/**
 * Builds the canonical Schema.org JSON-LD graph matching Google's latest standards.
 * Strictly uses real, visible information without fake ecommerce feeds or pricing.
 */
export function generateStructuredData(siteUrl: string, socialLinks?: { facebook?: string; instagram?: string }) {
  const fb = socialLinks?.facebook || 'https://www.facebook.com/signorabloom/';
  const insta = socialLinks?.instagram || 'https://instagram.com/tuhinajahantopa';

  const sameAsUrls = [fb, insta].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'SIGNORA BLOOM',
        alternateName: 'Signora Bloom',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          url: `${siteUrl}/assets/images/jewelry_hero_clean_1_1789492829951.jpg`,
          caption: 'SIGNORA BLOOM',
        },
        image: `${siteUrl}/assets/images/jewelry_hero_clean_1_1789492829951.jpg`,
        description:
          "A Curated Collection of Everyday Elegance — thoughtfully selected imported women's accessories, fashion jewelry, rings, bangles, bracelets, and earrings designed for modern everyday style.",
        sameAs: sameAsUrls,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'SIGNORA BLOOM',
        alternateName: 'Signora Bloom',
        description: "A Curated Collection of Everyday Elegance — Women's Jewelry & Fashion Accessories.",
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: "Signora Bloom - A Curated Collection of Everyday Elegance",
        description:
          "Discover Signora Bloom, a curated collection of women's jewelry and fashion accessories designed to bring effortless elegance to everyday style.",
        isPartOf: {
          '@id': `${siteUrl}/#website`,
        },
        about: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Collections',
            item: `${siteUrl}/#collections`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Everyday Elegance',
            item: `${siteUrl}/#everyday-elegance`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'About',
            item: `${siteUrl}/#about`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#curated-categories`,
        name: "Signora Bloom Curated Women's Accessories Categories",
        description: "Core accessory categories curated by Signora Bloom for modern everyday style.",
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Rings',
            description: "Feminine statement rings and delicate designs curated for everyday elegance.",
            url: `${siteUrl}/#collections`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Bangles & Bracelets',
            description: "Sculptural bangles and layered bracelets for stacking and everyday wear.",
            url: `${siteUrl}/#collections`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Earrings',
            description: "Fluted hoops, elegant studs, and drop earrings designed to elevate daily outfits.",
            url: `${siteUrl}/#collections`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Jewelry',
            description: "Curated medallion pendants, necklaces, and versatile jewelry accents.",
            url: `${siteUrl}/#collections`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: "Women's Fashion Accessories",
            description: "Curated accessories selected to bring personality and refined polish to any look.",
            url: `${siteUrl}/#collections`,
          },
        ],
      },
    ],
  };
}
