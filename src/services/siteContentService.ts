import { supabase, isSupabaseConfigured } from '../supabase';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../siteContent';

export const SITE_CONTENT_TABLE = 'site_content';
export const SITE_SETTINGS_DOC_ID = 'settings';

/**
 * Helper to deep merge partial settings into default or existing content
 */
export function mergeWithDefaults(partial: Partial<SiteContent> | any): SiteContent {
  if (!partial || typeof partial !== 'object') {
    return DEFAULT_SITE_CONTENT;
  }

  return {
    ...DEFAULT_SITE_CONTENT,
    ...partial,
    brand: {
      ...DEFAULT_SITE_CONTENT.brand,
      ...(partial.brand || {}),
    },
    hero: {
      ...DEFAULT_SITE_CONTENT.hero,
      slides: Array.isArray(partial.hero?.slides) && partial.hero.slides.length > 0
        ? partial.hero.slides
        : DEFAULT_SITE_CONTENT.hero.slides,
    },
    collections: Array.isArray(partial.collections) && partial.collections.length > 0
      ? partial.collections
      : DEFAULT_SITE_CONTENT.collections,
    editorial: {
      ...DEFAULT_SITE_CONTENT.editorial,
      ...(partial.editorial || {}),
      tabs: Array.isArray(partial.editorial?.tabs) && partial.editorial.tabs.length > 0
        ? partial.editorial.tabs
        : DEFAULT_SITE_CONTENT.editorial.tabs,
    },
    giftSection: {
      ...DEFAULT_SITE_CONTENT.giftSection,
      ...(partial.giftSection || {}),
      perks: Array.isArray(partial.giftSection?.perks)
        ? partial.giftSection.perks
        : DEFAULT_SITE_CONTENT.giftSection.perks,
      features: Array.isArray(partial.giftSection?.features)
        ? partial.giftSection.features
        : DEFAULT_SITE_CONTENT.giftSection.features,
    },
    everydayElegance: {
      ...DEFAULT_SITE_CONTENT.everydayElegance,
      ...(partial.everydayElegance || {}),
    },
    products: Array.isArray(partial.products) && partial.products.length > 0
      ? partial.products
      : DEFAULT_SITE_CONTENT.products,
    footer: {
      ...DEFAULT_SITE_CONTENT.footer,
      ...(partial.footer || {}),
    },
  };
}

/**
 * Fetches global site settings (image URLs, text, catalog) from Supabase database.
 * Falls back to DEFAULT_SITE_CONTENT if unconfigured or offline.
 */
export async function fetchSiteSettings(): Promise<SiteContent> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_SITE_CONTENT;
  }

  try {
    const { data, error } = await supabase
      .from(SITE_CONTENT_TABLE)
      .select('content')
      .eq('id', SITE_SETTINGS_DOC_ID)
      .maybeSingle();

    if (error) {
      console.warn('[siteContentService] Supabase fetch notice:', error.message);
      return DEFAULT_SITE_CONTENT;
    }

    if (data && data.content) {
      return mergeWithDefaults(data.content);
    }

    return DEFAULT_SITE_CONTENT;
  } catch (error) {
    console.warn('[siteContentService] Could not fetch settings from Supabase, using defaults:', error);
    return DEFAULT_SITE_CONTENT;
  }
}

/**
 * Updates global site settings in Supabase database.
 * Changes immediately propagate to all connected clients worldwide via Supabase Realtime.
 */
export async function updateSiteSettings(
  settings: Partial<SiteContent> | SiteContent,
  updatedBy?: string
): Promise<{ success: boolean; data?: SiteContent; error?: string }> {
  try {
    const merged = mergeWithDefaults(settings);
    const userIdentifier = updatedBy || 'admin';
    const payload = {
      id: SITE_SETTINGS_DOC_ID,
      content: merged,
      updated_at: new Date().toISOString(),
      updated_by: userIdentifier,
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from(SITE_CONTENT_TABLE)
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('[siteContentService] Error updating site settings in Supabase:', error);
        return {
          success: false,
          error: error.message || 'Failed to update site settings in Supabase',
        };
      }
    }

    return { success: true, data: merged };
  } catch (error: any) {
    console.error('[siteContentService] Error updating site settings:', error);
    return {
      success: false,
      error: error?.message || 'Failed to update site settings',
    };
  }
}

/**
 * Helper to update brand text in Supabase database.
 */
export async function updateBrandText(
  brandData: Partial<SiteContent['brand']>,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await fetchSiteSettings();
    const updatedBrand = {
      ...current.brand,
      ...brandData,
    };
    return await updateSiteSettings({ ...current, brand: updatedBrand }, updatedBy);
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update brand text' };
  }
}

/**
 * Helper to update image URLs in Supabase database.
 */
export async function updateImageUrls(
  images: {
    heroSlides?: SiteContent['hero']['slides'];
    editorialTabs?: SiteContent['editorial']['tabs'];
    products?: SiteContent['products'];
    collections?: SiteContent['collections'];
  },
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await fetchSiteSettings();
    const updated: Partial<SiteContent> = { ...current };

    if (images.heroSlides) {
      updated.hero = { ...current.hero, slides: images.heroSlides };
    }
    if (images.editorialTabs) {
      updated.editorial = { ...current.editorial, tabs: images.editorialTabs };
    }
    if (images.products) {
      updated.products = images.products;
    }
    if (images.collections) {
      updated.collections = images.collections;
    }

    return await updateSiteSettings(updated, updatedBy);
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update image URLs' };
  }
}

/**
 * Real-time listener for global site settings using Supabase Realtime channel.
 * Whenever an admin updates any content in Supabase, all active visitors hydrate immediately.
 */
export function subscribeSiteSettings(
  onUpdate: (content: SiteContent) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('public:site_content')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SITE_CONTENT_TABLE,
        filter: `id=eq.${SITE_SETTINGS_DOC_ID}`,
      },
      (payload) => {
        if (payload.new && (payload.new as any).content) {
          const cloudContent = (payload.new as any).content;
          const merged = mergeWithDefaults(cloudContent);
          onUpdate(merged);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' && err) {
        console.warn('[siteContentService] Realtime channel warning:', err.message);
        if (onError) onError(new Error(err.message));
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
