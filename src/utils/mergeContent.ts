import { DEFAULT_SITE_CONTENT, SiteContent } from '../siteContent';

/**
 * Deep merges hero slides preserving slide count and unedited fields
 */
export function mergeHeroSlides(
  baseSlides: { id: number; image: string; alt: string; headline: string; buttonText: string }[],
  incomingSlides?: any[]
): { id: number; image: string; alt: string; headline: string; buttonText: string }[] {
  if (!Array.isArray(incomingSlides) || incomingSlides.length === 0) {
    return baseSlides.map((s) => ({ ...s }));
  }

  const slideMap = new Map<number, { id: number; image: string; alt: string; headline: string; buttonText: string }>();
  baseSlides.forEach((slide, idx) => {
    slideMap.set(typeof slide.id === 'number' ? slide.id : idx, { ...slide });
  });

  incomingSlides.forEach((inc, idx) => {
    if (!inc || typeof inc !== 'object') return;
    const slideId = typeof inc.id === 'number' ? inc.id : idx;
    const existing = slideMap.get(slideId) || baseSlides[idx] || {
      id: slideId,
      image: '',
      alt: '',
      headline: '',
      buttonText: 'SHOP NOW',
    };

    slideMap.set(slideId, {
      ...existing,
      id: slideId,
      image: typeof inc.image === 'string' && inc.image.trim() !== '' ? inc.image : existing.image,
      alt: typeof inc.alt === 'string' ? inc.alt : existing.alt,
      headline: typeof inc.headline === 'string' ? inc.headline : existing.headline,
      buttonText: typeof inc.buttonText === 'string' ? inc.buttonText : existing.buttonText,
    });
  });

  const result: { id: number; image: string; alt: string; headline: string; buttonText: string }[] = [];
  const processedIds = new Set<number>();

  baseSlides.forEach((base, idx) => {
    const id = typeof base.id === 'number' ? base.id : idx;
    const merged = slideMap.get(id);
    if (merged) {
      result.push(merged);
      processedIds.add(id);
    }
  });

  slideMap.forEach((slide, id) => {
    if (!processedIds.has(id)) {
      result.push(slide);
    }
  });

  return result.length > 0 ? result : baseSlides.map((s) => ({ ...s }));
}

/**
 * Deep merges collection cards preserving existing card items
 */
export function mergeCollections(baseCollections: any[], incoming?: any[]) {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return baseCollections.map((c) => ({ ...c }));
  }
  const colMap = new Map<string, any>();
  baseCollections.forEach((c) => colMap.set(c.id, { ...c }));
  incoming.forEach((inc) => {
    if (!inc || !inc.id) return;
    const existing = colMap.get(inc.id) || {};
    colMap.set(inc.id, { ...existing, ...inc });
  });
  return Array.from(colMap.values());
}

/**
 * Deep merges editorial tabs preserving tabs and existing images
 */
export function mergeEditorialTabs(baseTabs: any[], incoming?: any[]) {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return baseTabs.map((t) => ({ ...t }));
  }
  const tabMap = new Map<string, any>();
  baseTabs.forEach((t) => tabMap.set(t.id, { ...t }));
  incoming.forEach((inc) => {
    if (!inc || !inc.id) return;
    const existing = tabMap.get(inc.id) || {};
    tabMap.set(inc.id, { ...existing, ...inc });
  });
  return Array.from(tabMap.values());
}

/**
 * Deep merges products catalog preserving existing products
 */
export function mergeProducts(baseProducts: any[], incoming?: any[]) {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return baseProducts.map((p) => ({ ...p }));
  }
  const prodMap = new Map<string, any>();
  baseProducts.forEach((p) => prodMap.set(p.id, { ...p }));
  incoming.forEach((inc) => {
    if (!inc || !inc.id) return;
    const existing = prodMap.get(inc.id) || {};
    prodMap.set(inc.id, { ...existing, ...inc });
  });
  return Array.from(prodMap.values());
}

/**
 * Robust deep merge of SiteContent that ensures partial updates
 * (e.g. updating one hero slide image) NEVER overwrite other sections or slides.
 */
export function mergeSiteContent(base: SiteContent, custom: any): SiteContent {
  if (!custom || typeof custom !== 'object') {
    return base;
  }

  const baseHero = base.hero || DEFAULT_SITE_CONTENT.hero;
  const baseCollections = base.collections || DEFAULT_SITE_CONTENT.collections;
  const baseEditorial = base.editorial || DEFAULT_SITE_CONTENT.editorial;
  const baseGift = base.giftSection || DEFAULT_SITE_CONTENT.giftSection;
  const baseProducts = base.products || DEFAULT_SITE_CONTENT.products;
  const baseFooter = base.footer || DEFAULT_SITE_CONTENT.footer;
  const baseBrand = base.brand || DEFAULT_SITE_CONTENT.brand;

  return {
    ...base,
    ...custom,
    brand: {
      ...baseBrand,
      ...(custom.brand || {}),
    },
    hero: {
      ...baseHero,
      ...(custom.hero || {}),
      slides: mergeHeroSlides(baseHero.slides, custom?.hero?.slides),
    },
    collections: mergeCollections(baseCollections, custom?.collections),
    editorial: {
      ...baseEditorial,
      ...(custom.editorial || {}),
      tabs: mergeEditorialTabs(baseEditorial.tabs, custom?.editorial?.tabs),
    },
    giftSection: {
      ...baseGift,
      ...(custom.giftSection || {}),
      perks: Array.isArray(custom?.giftSection?.perks) && custom.giftSection.perks.length > 0
        ? custom.giftSection.perks
        : baseGift.perks,
      features: Array.isArray(custom?.giftSection?.features) && custom.giftSection.features.length > 0
        ? custom.giftSection.features
        : baseGift.features,
    },
    everydayElegance: {
      title: custom?.everydayElegance?.title || base.everydayElegance?.title || DEFAULT_SITE_CONTENT.everydayElegance?.title || 'Everyday Elegance',
    },
    products: mergeProducts(baseProducts, custom?.products),
    footer: {
      ...baseFooter,
      ...(custom.footer || {}),
    },
  };
}

export function mergeWithDefaults(custom: any): SiteContent {
  return mergeSiteContent(DEFAULT_SITE_CONTENT, custom);
}
