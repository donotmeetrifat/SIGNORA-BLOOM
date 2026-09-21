import React, { useEffect } from 'react';
import { getSiteUrl, SEO_PAGES, generateStructuredData } from '../utils/seoConfig';
import { Accessory } from '../types';
import { useSiteContent } from '../context/SiteContentContext';

interface SeoHeadProps {
  currentPath: string;
  activeNavSection?: string;
  selectedPiece?: Accessory | null;
  isNotFound?: boolean;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  currentPath,
  activeNavSection = 'home',
  selectedPiece = null,
  isNotFound = false,
}) => {
  const { content } = useSiteContent();
  const siteUrl = getSiteUrl();

  useEffect(() => {
    // 1. Determine active SEO metadata
    const isAdmin =
      currentPath === '/rifat' ||
      currentPath.startsWith('/rifat/') ||
      currentPath === '/admin' ||
      currentPath.startsWith('/admin/');

    let pageMeta = SEO_PAGES.home;

    if (isAdmin) {
      pageMeta = SEO_PAGES.admin;
    } else if (isNotFound) {
      pageMeta = SEO_PAGES.notFound;
    } else if (selectedPiece) {
      pageMeta = {
        title: `${selectedPiece.name} | Signora Bloom`,
        description: `${selectedPiece.name} (${selectedPiece.categoryLabel}) — ${selectedPiece.description || selectedPiece.tagline}. Curated by Signora Bloom.`,
        canonicalPath: '/#everyday-elegance',
        ogType: 'product',
        ogImage: selectedPiece.image,
        ogImageAlt: `${selectedPiece.name} from Signora Bloom`,
      };
    } else if (activeNavSection && SEO_PAGES[activeNavSection]) {
      pageMeta = SEO_PAGES[activeNavSection];
    }

    // 2. Set document title
    document.title = pageMeta.title;

    // Helper to safely set or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 3. Update Standard SEO Meta Tags
    setMetaTag('name', 'description', pageMeta.description);

    // Robots meta: noindex for admin/404, full index for public
    if (pageMeta.noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow, noarchive');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 4. Update Canonical Link
    const canonicalUrl = `${siteUrl}${pageMeta.canonicalPath || '/'}`;
    setLinkTag('canonical', canonicalUrl);

    // 5. Update Open Graph Meta Tags
    setMetaTag('property', 'og:site_name', 'SIGNORA BLOOM');
    setMetaTag('property', 'og:title', pageMeta.title);
    setMetaTag('property', 'og:description', pageMeta.description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', pageMeta.ogType || 'website');

    const defaultOgImg = `${siteUrl}/assets/images/jewelry_hero_clean_1_1789492829951.jpg`;
    const finalOgImg = pageMeta.ogImage
      ? pageMeta.ogImage.startsWith('http')
        ? pageMeta.ogImage
        : `${siteUrl}${pageMeta.ogImage}`
      : defaultOgImg;

    setMetaTag('property', 'og:image', finalOgImg);
    setMetaTag('property', 'og:image:alt', pageMeta.ogImageAlt || "Signora Bloom Women's Jewelry and Fashion Accessories");

    // 6. Update Twitter Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageMeta.title);
    setMetaTag('name', 'twitter:description', pageMeta.description);
    setMetaTag('name', 'twitter:image', finalOgImg);

    // 7. Inject/Update Schema.org JSON-LD structured data (skip on private admin page)
    if (!isAdmin) {
      let scriptTag = document.getElementById('signora-bloom-ld-json') as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'signora-bloom-ld-json';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      const socialLinks = {
        facebook: content?.brand?.facebookUrl,
        instagram: content?.brand?.instagramUrl,
      };
      const schemaData = generateStructuredData(siteUrl, socialLinks);
      scriptTag.textContent = JSON.stringify(schemaData, null, 2);
    }
  }, [currentPath, activeNavSection, selectedPiece, isNotFound, siteUrl, content]);

  return null;
};
