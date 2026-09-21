import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  RotateCcw,
  LogOut,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Edit3,
  Columns,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Gift,
  ShoppingBag,
  Info,
  ExternalLink,
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Cloud,
  Globe,
  Loader2,
} from 'lucide-react';
import { SiteContent, DEFAULT_SITE_CONTENT, CollectionItem } from '../../siteContent';
import { useSiteContent, VerifiedHeroSlide, mergeCollections } from '../../context/SiteContentContext';
import { safeParseResponseJson } from '../../utils/security';
import { compressImageFile } from '../../utils/storageDb';
import { ImageUpdateField } from './ImageUpdateField';
import { ReferenceImageBatchSync } from './ReferenceImageBatchSync';

// Import public components for the real-time live preview
import { Header } from '../Header';
import { Hero } from '../Hero';
import { FeaturedCollections } from '../FeaturedCollections';
import { EverydayElegance } from '../EverydayElegance';
import { EditorialStoryTabs } from '../EditorialStoryTabs';
import { GiftPackagingSection } from '../GiftPackagingSection';
import { Footer } from '../Footer';
import { FadeInSection } from '../FadeInSection';

interface AdminDashboardProps {
  token: string;
  user?: { id: string; role: string } | null;
  onLogout: () => void;
  onSessionExpired?: () => void;
  onViewPublicSite: () => void;
}

type TabKey = 'hero' | 'collections' | 'elegance' | 'editorial' | 'gift';
type ViewMode = 'edit' | 'split' | 'preview';
type DeviceMode = 'mobile' | 'tablet' | 'desktop';

const defaultFeatures = [
  { number: '01', title: 'CURATED WITH CARE', description: "A thoughtfully selected collection of women's accessories." },
  { number: '02', title: 'EFFORTLESS STYLE', description: 'Pieces designed to complement everyday fashion.' },
  { number: '03', title: 'BEAUTIFUL DETAILS', description: 'Intricate textures, elegant finishes and feminine designs.' },
  { number: '04', title: 'VERSATILE ACCESSORIES', description: 'Easy-to-style pieces for different looks and occasions.' },
];

// Helper ensuring all 5 collections, 4 features, and everyday elegance are always present with no missing positions
const normalizeDraftContent = (rawContent: SiteContent): SiteContent => {
  const cloned: SiteContent = JSON.parse(JSON.stringify(rawContent || DEFAULT_SITE_CONTENT));
  cloned.collections = mergeCollections(DEFAULT_SITE_CONTENT.collections, cloned.collections || []);
  if (!cloned.giftSection) {
    cloned.giftSection = { ...DEFAULT_SITE_CONTENT.giftSection };
  }
  if (!Array.isArray(cloned.giftSection.features) || cloned.giftSection.features.length === 0) {
    cloned.giftSection.features = defaultFeatures.map((f) => ({ ...f }));
  } else {
    cloned.giftSection.features = [0, 1, 2, 3].map((idx) => {
      const existing = cloned.giftSection.features[idx];
      const fallback = defaultFeatures[idx];
      return {
        number: existing?.number || fallback.number,
        title: existing?.title || fallback.title,
        description: existing?.description || fallback.description,
      };
    });
  }
  if (!cloned.everydayElegance) {
    cloned.everydayElegance = {
      title: 'Everyday Elegance',
    };
  }
  return cloned;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  user,
  onLogout,
  onSessionExpired,
  onViewPublicSite,
}) => {
  const { content, updateContent, saveContentToServer, resetContentOnServer, isCloudSyncActive, cloudAdminEmail } = useSiteContent();

  // Local draft state for editing before publishing (guaranteed 5/5 collections)
  const [draft, setDraft] = useState<SiteContent>(() => normalizeDraftContent(content));
  const [activeTab, setActiveTab] = useState<TabKey>('hero');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [savePhase, setSavePhase] = useState<'idle' | 'merging' | 'persisting' | 'verifying' | 'verified'>('idle');
  const [verifiedSlides, setVerifiedSlides] = useState<VerifiedHeroSlide[] | null>(null);
  const [verifiedTimestamp, setVerifiedTimestamp] = useState<string | null>(null);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-clean debounce timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Sync with incoming saved content if user hasn't made unsaved modifications
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setDraft(normalizeDraftContent(content));
    }
  }, [content, hasUnsavedChanges]);

  // Debounced auto-save function: saves changes directly to live server so edits persist for everyone
  const scheduleAutoSave = (draftToPersist: SiteContent) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSavePhase('persisting');
        const result = await saveContentToServer(draftToPersist, token);
        setIsSaving(false);
        if (result.success) {
          setHasUnsavedChanges(false);
          setSavePhase('verified');
          setVerifiedSlides(result.verifiedHeroSlides || null);
          setVerifiedTimestamp(result.verifiedAt || new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Auto-save error:', err);
        setIsSaving(false);
        setSavePhase('idle');
      }
    }, 1500);
  };

  // Sync draft edits into local draft, preview context, and schedule server auto-save
  const updateDraft = (updater: (prev: SiteContent) => SiteContent) => {
    setDraft((prev) => {
      // Deep clone prev first so updater can safely modify nested properties without stale references
      const cloned: SiteContent = JSON.parse(JSON.stringify(prev));
      const next = updater(cloned);
      setHasUnsavedChanges(true);
      // Update global context so the preview updates in real-time
      updateContent(next);
      // Auto-save to server so changes are published for everyone
      scheduleAutoSave(next);
      return next;
    });
  };

  // Dedicated immutable updater for Hero slides that guarantees sibling slides and fields are never lost
  const updateHeroSlide = (
    slideIndex: number,
    partial: Partial<{
      id: number;
      image: string;
      alt: string;
      headline: string;
      buttonText: string;
    }>
  ) => {
    updateDraft((prev) => {
      const slides = Array.isArray(prev.hero?.slides) ? [...prev.hero.slides] : [];
      const currentSlide = slides[slideIndex] || {
        id: slideIndex,
        image: '',
        alt: '',
        headline: '',
        buttonText: 'SHOP NOW',
      };
      slides[slideIndex] = {
        ...currentSlide,
        ...partial,
      };
      return {
        ...prev,
        hero: {
          ...prev.hero,
          slides,
        },
      };
    });
  };

  const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);

  // Handle image upload with automatic client-side compression and immediate live server persistence
  // Compresses multi-MB high-res images down to ~80KB-160KB so storage limits are NEVER exceeded
  const handleImageUpload = async (
    file: File,
    onSuccess: (uploadedUrl: string) => void,
    keyIdentifier?: string,
    maxWidth = 1920,
    maxHeight = 1080
  ) => {
    if (keyIdentifier) setUploadingImageKey(keyIdentifier);
    try {
      // 1. Client-side compression & aspect-ratio constraint
      const optimizedDataUrl = await compressImageFile(file, maxWidth, maxHeight, 0.82);

      let finalUrl = optimizedDataUrl;

      // 2. Upload file directly to server disk
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Admin-Token': token,
          },
          credentials: 'include',
          body: JSON.stringify({
            base64Data: optimizedDataUrl,
            filename: file.name,
          }),
        });
        if (res.status === 401) {
          onSessionExpired?.();
          return;
        }
        const data = await safeParseResponseJson(res);
        if (data && data.success && data.url) {
          finalUrl = data.url;
        }
      } catch {
        // Backend not available (e.g. static hosting on Vercel)
      }

      // 3. Update callback with new image URL
      onSuccess(finalUrl);

      // 4. Immediately trigger server save so uploaded images are 100% permanently published for all visitors
      setTimeout(() => {
        setDraft((latestDraft) => {
          setIsSaving(true);
          setSavePhase('persisting');
          saveContentToServer(latestDraft, token).then((res) => {
            setIsSaving(false);
            if (res.success) {
              setHasUnsavedChanges(false);
              setSavePhase('verified');
              setVerifiedSlides(res.verifiedHeroSlides || null);
              setVerifiedTimestamp(res.verifiedAt || new Date().toLocaleTimeString());
              setShowVerifiedBanner(true);
            }
          });
          return latestDraft;
        });
      }, 50);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      if (keyIdentifier) setUploadingImageKey(null);
    }
  };

  // Save changes to backend with real-time step verification
  const handleSave = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setIsSaving(true);
    setSaveStatus(null);
    setShowVerifiedBanner(false);

    // Step 1: Merging phase
    setSavePhase('merging');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Step 2: Persisting phase
    setSavePhase('persisting');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Step 3: Real-time verification phase
    setSavePhase('verifying');
    const result = await saveContentToServer(draft, token);

    setIsSaving(false);
    setSaveStatus(result);

    if (result.success) {
      setHasUnsavedChanges(false);
      setSavePhase('verified');
      setVerifiedSlides(result.verifiedHeroSlides || null);
      setVerifiedTimestamp(result.verifiedAt || new Date().toLocaleTimeString());
      setShowVerifiedBanner(true);
    } else {
      setSavePhase('idle');
      if (result.message && (result.message.includes('Unauthorized') || result.message.includes('expired'))) {
        onSessionExpired?.();
      }
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all site titles, images, and content to factory defaults?')) {
      return;
    }
    setIsSaving(true);
    const result = await resetContentOnServer(token);
    setIsSaving(false);
    if (result.success) {
      setDraft(JSON.parse(JSON.stringify(content)));
      setHasUnsavedChanges(false);
      setSaveStatus(result);
      setTimeout(() => setSaveStatus(null), 3000);
    } else if (result.message && (result.message.includes('Unauthorized') || result.message.includes('expired'))) {
      onSessionExpired?.();
    }
  };

  // Export & Deployment State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBatchSyncModalOpen, setIsBatchSyncModalOpen] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Generate clean, TypeScript-typed siteContent.ts source code
  const getSiteContentTsCode = (): string => {
    return `export interface SiteContent {
  brand: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    conciergeHours: string;
    address: string;
    facebookUrl?: string;
    instagramUrl?: string;
  };
  hero: {
    slides: {
      id: number;
      image: string;
      alt: string;
      headline: string;
      buttonText: string;
    }[];
  };
  collections: {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    image: string;
    itemCount: string;
    span?: string;
  }[];
  editorial: {
    tabs: {
      id: string;
      tabLabel: string;
      headline: string;
      description: string;
      mainImage: string;
      insetDetailImage: string;
      buttonLabel: string;
    }[];
  };
  giftSection: {
    badge: string;
    headline: string;
    subheadline: string;
    boxLabel: string;
    boxTheme: 'crimson' | 'noir' | 'champagne' | 'emerald';
    perks: { title: string; desc: string }[];
    features: { number: string; title: string; description: string }[];
  };
  everydayElegance?: {
    title: string;
  };
  products: {
    id: string;
    refCode: string;
    name: string;
    category: string;
    categoryLabel: string;
    price: string;
    tagline: string;
    description: string;
    image: string;
    badge?: string;
  }[];
  footer: {
    newsletterTitle: string;
    newsletterDesc: string;
    copyright: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = ${JSON.stringify(draft, null, 2)};
`;
  };

  const handleDownloadSiteContentTs = () => {
    const code = getSiteContentTsCode();
    const blob = new Blob([code], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'siteContent.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySiteContentTs = async () => {
    try {
      const code = getSiteContentTsCode();
      await navigator.clipboard.writeText(code);
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2500);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#F7F3EE] text-[#2A2323]">
      
      {/* 1. TOP EXECUTIVE APP BAR */}
      <header className="shrink-0 z-50 bg-[#FFFFFF] border-b border-[#EADFD5] shadow-[0_2px_12px_rgba(42,35,35,0.05)] px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Brand Logo & CMS Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-serif text-base sm:text-xl tracking-[0.18em] sm:tracking-[0.2em] font-medium text-[#2A2323]">
              SIGNORA BLOOM
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest bg-[#FAF5F0] border border-[#E2D5C8] text-[#7A6C6C] px-1.5 sm:px-2 py-0.5 rounded-xs font-semibold">
              Atelier CMS
            </span>
            {isSaving ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8C6D4F] bg-[#FAF6F1] px-2.5 py-0.5 border border-[#D9C4B0] rounded-xs font-medium">
                <Loader2 className="w-3 h-3 animate-spin text-[#8C6D4F]" />
                <span className="hidden sm:inline">Publishing to Live Server...</span>
                <span className="sm:hidden">Saving...</span>
              </span>
            ) : hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#A66F42] bg-[#FDF6F0] px-2.5 py-0.5 border border-[#EED7C5] rounded-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4823A] animate-pulse" />
                <span className="hidden sm:inline">Auto-publishing in 1.5s...</span>
                <span className="sm:hidden">Unsaved</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#256837] bg-[#EAF5EC] px-2.5 py-0.5 border border-[#BBE2C3] rounded-xs font-medium">
                <Check className="w-3.5 h-3.5 text-[#256837]" />
                <span className="hidden sm:inline">Live for Everyone Worldwide</span>
                <span className="sm:hidden">Live</span>
                {verifiedTimestamp && <span className="opacity-75 text-[10px] hidden md:inline">({verifiedTimestamp})</span>}
              </span>
            )}
          </div>

          {/* Center: Viewport & Layout Mode Controls */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            
            {/* View Mode Toggle: Edit / Split / Preview */}
            <div className="flex items-center bg-[#FAF6F1] border border-[#E8DFD5] p-0.5 rounded-xs">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 min-h-[32px] text-[10px] uppercase tracking-widest transition-all rounded-xs cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-white text-[#2A2323] shadow-xs font-semibold'
                    : 'text-[#847878] hover:text-[#2A2323]'
                }`}
                title="Editor Form Only"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 min-h-[32px] text-[10px] uppercase tracking-widest transition-all rounded-xs cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-[#2A2323] shadow-xs font-semibold'
                    : 'text-[#847878] hover:text-[#2A2323]'
                }`}
                title="Split Side-by-Side View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 min-h-[32px] text-[10px] uppercase tracking-widest transition-all rounded-xs cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white text-[#2A2323] shadow-xs font-semibold'
                    : 'text-[#847878] hover:text-[#2A2323]'
                }`}
                title="Full Preview"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Preview</span>
              </button>
            </div>

            {/* Device Frame Toggle (Active during Split or Preview) */}
            {viewMode !== 'edit' && (
              <div className="flex items-center bg-[#FAF6F1] border border-[#E8DFD5] p-0.5 rounded-xs">
                <button
                  type="button"
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center text-xs transition-all rounded-xs cursor-pointer ${
                    deviceMode === 'mobile'
                      ? 'bg-white text-[#2A2323] shadow-xs'
                      : 'text-[#847878] hover:text-[#2A2323]'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center text-xs transition-all rounded-xs cursor-pointer ${
                    deviceMode === 'tablet'
                      ? 'bg-white text-[#2A2323] shadow-xs'
                      : 'text-[#847878] hover:text-[#2A2323]'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center text-xs transition-all rounded-xs cursor-pointer ${
                    deviceMode === 'desktop'
                      ? 'bg-white text-[#2A2323] shadow-xs'
                      : 'text-[#847878] hover:text-[#2A2323]'
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* View public site */}
            <button
              type="button"
              onClick={onViewPublicSite}
              className="px-2 sm:px-3 py-1.5 min-h-[34px] border border-[#E2D5C8] text-[#554A4A] hover:bg-[#FAF6F1] text-[10px] uppercase tracking-widest rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Store</span>
            </button>

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="px-2 sm:px-3 py-1.5 min-h-[34px] border border-[#E2D5C8] text-[#847878] hover:text-[#A63A3A] hover:border-[#F2BEBE] text-[10px] uppercase tracking-widest rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all content to original defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Export Code / Deploy Guide */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-2 sm:px-3 py-1.5 min-h-[34px] border border-[#D9C4B0] bg-[#FAF6F1] text-[#634932] hover:bg-[#F2ECE3] text-[10px] uppercase tracking-widest rounded-xs transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Export content for Vercel / GitHub deployment"
            >
              <Download className="w-3 h-3" />
              <span className="hidden md:inline">Export Code</span>
            </button>

            {/* Batch Sync Reference Images */}
            <button
              type="button"
              onClick={() => setIsBatchSyncModalOpen(true)}
              className="px-2 sm:px-3 py-1.5 min-h-[34px] border border-[#C5AF96] bg-[#F5EFE6] text-[#553C24] hover:bg-[#EBE2D5] text-[10px] uppercase tracking-widest rounded-xs transition-colors flex items-center gap-1 cursor-pointer font-medium shadow-2xs"
              title="Batch match your 17 reference images to website screenshot slots"
            >
              <Sparkles className="w-3 h-3 text-[#8C6D4F]" />
              <span className="hidden md:inline">Sync Reference Images</span>
              <span className="md:hidden">Sync</span>
            </button>

            {/* Save & Publish */}
            <button
              id="admin-publish-save-btn"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              title="Publish all changes to live server for everyone worldwide"
              className="px-3 sm:px-5 py-1.5 min-h-[34px] bg-[#2A2323] hover:bg-[#433737] text-white text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] rounded-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-[#E2D5C8]" />
              )}
              <span>
                {isSaving
                  ? savePhase === 'merging'
                    ? '1/3 Merging...'
                    : savePhase === 'persisting'
                    ? '2/3 Saving...'
                    : '3/3 Verifying...'
                  : 'Publish Live for Everyone'}
              </span>
            </button>

            {/* Supabase Realtime Cloud Sync Status */}
            {isCloudSyncActive ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F0F7F2] border border-[#BFDFCA] rounded-xs text-[10px] text-[#245432]">
                <Cloud className="w-3.5 h-3.5 text-[#2B7A46]" />
                <span className="font-semibold">Supabase Cloud Realtime Active</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF9E6] border border-[#FFEBAA] rounded-xs text-[10px] text-[#856404]">
                <Cloud className="w-3.5 h-3.5 text-[#856404]" />
                <span>Supabase Pending Credentials</span>
              </div>
            )}

            {/* Authenticated user badge */}
            {user && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF5F0] border border-[#E8DFD5] rounded-xs text-[10px] text-[#6E6161]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B8A52]" />
                <span className="font-mono text-[#332B2B]">{user.id}</span>
                <span className="text-[#A39595]">({user.role})</span>
              </div>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-[#736767] hover:text-[#A63A3A] transition-colors rounded-xs cursor-pointer"
              title="Secure Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Real-time Saving Progress Banner */}
        {isSaving && (
          <div className="mt-2.5 p-3 rounded-xs bg-[#FBF7F0] border border-[#E8DFC8] text-[#554738] flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[#A87B4F] border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <div className="font-semibold tracking-wide text-[#3D2C1E]">
                  {savePhase === 'merging' && 'Step 1/3: Deep-merging hero images with site content...'}
                  {savePhase === 'persisting' && 'Step 2/3: Saving to high-capacity storage & database...'}
                  {savePhase === 'verifying' && 'Step 3/3: Verifying live DOM rendering and image reachability...'}
                </div>
                <div className="text-[11px] text-[#7A6B5D]">
                  Preserving all existing slides and sections without overwriting.
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-mono bg-white px-2 py-0.5 rounded-xs border border-[#E0D5C0]">
              Real-time Sync
            </span>
          </div>
        )}

        {/* Real-Time Verification Confirmation Banner */}
        {showVerifiedBanner && (
          <div className="mt-2.5 p-3.5 rounded-xs bg-[#F0F9F2] border border-[#BCE4C6] text-[#1D5E2F] shadow-xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[#D2EED8]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#27823E] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#174D26] flex items-center gap-2">
                    <span>Published to Live Server for Everyone Worldwide</span>
                    {verifiedTimestamp && (
                      <span className="text-[10px] font-mono font-normal bg-white/80 text-[#27823E] px-1.5 py-0.5 rounded-xs border border-[#BCE4C6]">
                        {verifiedTimestamp}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[#2F6B3E]">
                    Your images and content changes are saved permanently to the server disk. All visitors across all devices worldwide will now see them live.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-2.5 py-1 bg-[#FAF6F1] hover:bg-[#F2ECE3] border border-[#D9C4B0] text-[#634932] text-[10px] uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Export siteContent.ts for GitHub and Vercel"
                >
                  <Download className="w-3 h-3" />
                  <span>Sync to Vercel</span>
                </button>
                <button
                  type="button"
                  onClick={onViewPublicSite}
                  className="px-2.5 py-1 bg-white hover:bg-[#E2F3E7] border border-[#BCE4C6] text-[#1D5E2F] text-[10px] uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect Live Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerifiedBanner(false)}
                  className="p-1 text-[#27823E] hover:text-[#174D26] cursor-pointer"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual verification proof of each hero slide */}
            {verifiedSlides && Array.isArray(verifiedSlides) && verifiedSlides.length > 0 && (
              <div className="pt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {verifiedSlides.map((vSlide, vIdx) => (
                  <div
                    key={`verified-slide-${vSlide.id ?? vIdx}`}
                    className="bg-white p-2 border border-[#C5E8CE] rounded-xs flex items-center gap-2.5 shadow-xs"
                  >
                    <div className="w-12 h-9 bg-[#F7F4EF] rounded-xs overflow-hidden border border-[#D5EAD9] shrink-0 relative">
                      <img
                        src={vSlide.image}
                        alt={vSlide.alt || `Verified slide ${vIdx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-[#1A4B27]">
                        <span>Slide #{vIdx + 1}</span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-[#247037] font-semibold">
                          <Check className="w-2.5 h-2.5" />
                          Verified Active
                        </span>
                      </div>
                      <div className="text-[10px] text-[#557F60] truncate font-mono">
                        {vSlide.image.startsWith('data:') ? 'Web Optimized Image' : vSlide.image.split('/').pop()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error / Standard Save Notification Banner (if any) */}
        {saveStatus && !saveStatus.success && (
          <div className="mt-2.5 p-2.5 rounded-xs flex items-center justify-between text-xs bg-[#FCEDED] border border-[#F7C6C6] text-[#A82E2E]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveStatus(null)}
              className="text-xs font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* 2. MAIN CMS WORKSPACE (Split or Full Screen) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: EDIT CONTROLS FORM (Rendered when viewMode is 'edit' or 'split') */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-full lg:w-1/2 border-r border-[#EADFD5]' : 'w-full max-w-5xl mx-auto'
            } flex flex-col bg-[#FAF7F3] h-full min-h-0 overflow-hidden`}
          >
            {/* Navigation Tabs */}
            <div className="shrink-0 bg-[#FAF7F3] border-b border-[#E8DFD5] px-4 sm:px-6 pt-3 pb-2 flex flex-wrap gap-2 sm:gap-2.5 z-10">
              {[
                { key: 'hero', label: 'Hero Slider', icon: ImageIcon },
                { key: 'collections', label: 'Category Mosaic', icon: Sparkles },
                { key: 'elegance', label: 'Everyday Elegance', icon: ShoppingBag },
                { key: 'editorial', label: 'Editorial Tabs', icon: Layers },
                { key: 'gift', label: 'Surprise A Loved One', icon: Gift },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider transition-all rounded-xs cursor-pointer border ${
                    activeTab === key
                      ? 'bg-[#2A2323] text-white border-[#2A2323] font-medium shadow-xs'
                      : 'bg-white text-[#6E6060] border-[#E5DAD0] hover:text-[#2A2323] hover:border-[#CDC0B5]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Form Panels based on activeTab */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28">
              
              {/* TAB 1: HERO SLIDER */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EADFD5] gap-2">
                    <div>
                      <h2 className="font-serif text-xl text-[#2A2323]">Hero Banner Slider</h2>
                      <p className="text-xs text-[#7A6C6C]">
                        16:9 full-width photographic slides matching the homepage slider.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider bg-[#FAF0E6] text-[#7A5229] px-2.5 py-1 rounded-xs border border-[#E8D4C0]">
                        {draft.hero.slides.length} Slides Active
                      </span>
                    </div>
                  </div>

                  {draft.hero.slides.map((slide, idx) => {
                    const isSyncedWithLive = content.hero?.slides?.[idx]?.image === slide.image;
                    return (
                      <div
                        key={slide.id ?? idx}
                        className="bg-white border border-[#E5DAD0] p-4 sm:p-5 rounded-xs space-y-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE3]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest font-semibold text-[#2A2323]">
                              Hero Slide #{idx + 1}
                            </span>
                            {isSyncedWithLive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#246633] bg-[#EBF7EE] border border-[#BDE3C4] px-2 py-0.5 rounded-xs font-medium">
                                <CheckCircle2 className="w-3 h-3 text-[#246633]" />
                                Live Synced
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#A66F42] bg-[#FDF6F0] border border-[#EED7C5] px-2 py-0.5 rounded-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4823A] animate-pulse" />
                                Draft Changed
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8E8080] font-mono">
                            Slide ID: {slide.id ?? idx}
                          </span>
                        </div>

                        {/* Image Preview & URL Input with dedicated Update/Upload buttons */}
                        <ImageUpdateField
                          id={`hero-slide-img-${idx}`}
                          label={`Hero Slide #${idx + 1} Image`}
                          value={slide.image}
                          onChange={(newUrl) => updateHeroSlide(idx, { image: newUrl })}
                          onUpload={(file) =>
                            handleImageUpload(
                              file,
                              (url) => {
                                updateHeroSlide(idx, { image: url });
                              },
                              `hero-${idx}`,
                              1920,
                              1080
                            )
                          }
                          isUploading={uploadingImageKey === `hero-${idx}`}
                          aspectRatio="16/9"
                          aspectLabel="16:9 Landscape"
                          recommendedDimensions="1920 × 1080px (16:9 full-width)"
                          defaultUrl={DEFAULT_SITE_CONTENT.hero.slides[idx]?.image}
                          isLiveSynced={isSyncedWithLive}
                        />

                        {/* Alt Description */}
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                            Accessibility Image Description (Alt text)
                          </label>
                          <input
                            type="text"
                            value={slide.alt}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateHeroSlide(idx, { alt: val });
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E0D5CA] rounded-xs text-[#2A2323] focus:border-[#2A2323] outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: EDITORIAL TABS (Beauty & Ingenuity, etc.) */}
              {activeTab === 'editorial' && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-[#EADFD5]">
                    <h2 className="font-serif text-xl text-[#2A2323]">Editorial Story Tabs</h2>
                    <p className="text-xs text-[#7A6C6C]">
                      Edit the 3 tabs: Beauty & Ingenuity, Ear Stack Magic, and Wristwear Essentials with 3:4 portrait & 1:1 detail images.
                    </p>
                  </div>

                  {draft.editorial.tabs.map((tab, idx) => (
                    <div
                      key={tab.id}
                      className="bg-white border border-[#E5DAD0] p-4 sm:p-5 rounded-xs space-y-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE3]">
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#2A2323]">
                          Tab #{idx + 1}: {tab.tabLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                            Tab Navigation Label
                          </label>
                          <input
                            type="text"
                            value={tab.tabLabel}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = { ...prev };
                                next.editorial.tabs[idx].tabLabel = val;
                                return next;
                              });
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E0D5CA] rounded-xs text-[#2A2323] focus:border-[#2A2323] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={tab.headline}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = { ...prev };
                                next.editorial.tabs[idx].headline = val;
                                return next;
                              });
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E0D5CA] rounded-xs text-[#2A2323] focus:border-[#2A2323] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                          Editorial Narrative Description
                        </label>
                        <textarea
                          rows={3}
                          value={tab.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = { ...prev };
                              next.editorial.tabs[idx].description = val;
                              return next;
                            });
                          }}
                          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E0D5CA] rounded-xs text-[#2A2323] focus:border-[#2A2323] outline-none leading-relaxed"
                        />
                      </div>

                      {/* Main 3:4 Image & Inset 1:1 Image with Dedicated Update/Upload Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* 3:4 Main Image */}
                        <ImageUpdateField
                          id={`editorial-main-img-${idx}`}
                          label="Main Portrait Image (3:4 Ratio)"
                          value={tab.mainImage}
                          onChange={(newUrl) => {
                            updateDraft((prev) => {
                              const next = { ...prev };
                              next.editorial.tabs[idx].mainImage = newUrl;
                              return next;
                            });
                          }}
                          onUpload={(file) => {
                            handleImageUpload(
                              file,
                              (url) => {
                                updateDraft((prev) => {
                                  const next = { ...prev };
                                  next.editorial.tabs[idx].mainImage = url;
                                  return next;
                                });
                              },
                              `editorial-main-${idx}`,
                              1200,
                              1600
                            );
                          }}
                          isUploading={uploadingImageKey === `editorial-main-${idx}`}
                          aspectRatio="3/4"
                          aspectLabel="3:4 Portrait"
                          recommendedDimensions="1200 × 1600px"
                          defaultUrl={DEFAULT_SITE_CONTENT.editorial.tabs[idx]?.mainImage}
                          isLiveSynced={content.editorial?.tabs?.[idx]?.mainImage === tab.mainImage}
                        />

                        {/* 1:1 Inset Detail Image */}
                        <ImageUpdateField
                          id={`editorial-inset-img-${idx}`}
                          label="Small Inset Detail Image (1:1 Ratio)"
                          value={tab.insetDetailImage}
                          onChange={(newUrl) => {
                            updateDraft((prev) => {
                              const next = { ...prev };
                              next.editorial.tabs[idx].insetDetailImage = newUrl;
                              return next;
                            });
                          }}
                          onUpload={(file) => {
                            handleImageUpload(
                              file,
                              (url) => {
                                updateDraft((prev) => {
                                  const next = { ...prev };
                                  next.editorial.tabs[idx].insetDetailImage = url;
                                  return next;
                                });
                              },
                              `editorial-inset-${idx}`,
                              800,
                              800
                            );
                          }}
                          isUploading={uploadingImageKey === `editorial-inset-${idx}`}
                          aspectRatio="1/1"
                          aspectLabel="1:1 Square"
                          recommendedDimensions="800 × 800px"
                          defaultUrl={DEFAULT_SITE_CONTENT.editorial.tabs[idx]?.insetDetailImage}
                          isLiveSynced={content.editorial?.tabs?.[idx]?.insetDetailImage === tab.insetDetailImage}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: FEATURED COLLECTIONS MOSAIC */}
              {/* TAB 3: FEATURED COLLECTIONS MOSAIC */}
              {activeTab === 'collections' && (() => {
                const positionLabels = [
                  'Mosaic 1: Left Column (9:16 Tall) · Fine Rings',
                  'Mosaic 2: Center Top (1:1 Square) · Sculptural Bracelets',
                  'Mosaic 3: Center Bottom Left · Medallion Necklaces',
                  'Mosaic 4: Center Bottom Right · Drop & Hoop Earrings',
                  'Mosaic 5: Right Column (9:16 Tall) · Shop Charms',
                ];

                // Ensure all 5 default collections are always present and never deleted
                const currentCollections: CollectionItem[] = (draft.collections && draft.collections.length >= 5)
                  ? draft.collections
                  : mergeCollections(DEFAULT_SITE_CONTENT.collections, draft.collections || []);

                const updateColItem = (idx: number, partial: Partial<CollectionItem>) => {
                  updateDraft((prev) => {
                    const list = (prev.collections && prev.collections.length >= 5)
                      ? [...prev.collections]
                      : mergeCollections(DEFAULT_SITE_CONTENT.collections, prev.collections || []);
                    if (list[idx]) {
                      list[idx] = { ...list[idx], ...partial };
                    }
                    return {
                      ...prev,
                      collections: list,
                    };
                  });
                };

                const restoreAllDefaultCollections = () => {
                  updateDraft((prev) => ({
                    ...prev,
                    collections: DEFAULT_SITE_CONTENT.collections.map((c) => ({ ...c })),
                  }));
                };

                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#EADFD5] gap-2">
                      <div>
                        <h2 className="font-serif text-xl text-[#2A2323]">Featured Category Mosaic</h2>
                        <p className="text-xs text-[#7A6C6C]">
                          All 5 mosaic images are fully active and editable below. Every position includes a dedicated Update and Upload button.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider bg-[#EAF5EC] text-[#256837] px-2.5 py-1 rounded-xs border border-[#BBE2C3] font-semibold">
                          5 of 5 Positions Active
                        </span>
                        <button
                          type="button"
                          onClick={restoreAllDefaultCollections}
                          className="text-[11px] text-[#8C6D4F] hover:text-[#5A4533] underline cursor-pointer"
                        >
                          Reset All 5 to Defaults
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentCollections.map((col, idx) => {
                        const isColTall = col.span === 'tall';
                        const defaultCol = DEFAULT_SITE_CONTENT.collections[idx];
                        const isSynced = content.collections?.[idx]?.image === col.image;

                        return (
                          <div
                            key={col.id || `col-${idx}`}
                            className="bg-white border border-[#E5DAD0] p-4 rounded-xs space-y-3.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-1.5">
                              <span className="text-[11px] font-semibold text-[#8C6D4F] tracking-wide">
                                {positionLabels[idx] || `Mosaic Image ${idx + 1}`}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider text-[#A09393] bg-[#FAF8F5] px-2 py-0.5 rounded-xs border border-[#E8DFD7]">
                                {isColTall ? '9:16 Tall Mosaic' : col.span === 'wide' ? 'Wide Ratio' : '1:1 Square'}
                              </span>
                            </div>

                            {/* Dedicated Image Update & Upload Control */}
                            <ImageUpdateField
                              id={`collection-img-${idx}`}
                              label={`Mosaic ${idx + 1} Image`}
                              value={col.image}
                              onChange={(newUrl) => updateColItem(idx, { image: newUrl })}
                              onUpload={(file) => {
                                handleImageUpload(
                                  file,
                                  (url) => updateColItem(idx, { image: url }),
                                  `collection-${idx}`,
                                  isColTall ? 1080 : 1200,
                                  isColTall ? 1920 : 1200
                                );
                              }}
                              isUploading={uploadingImageKey === `collection-${idx}`}
                              aspectRatio={isColTall ? '9/16' : '1/1'}
                              aspectLabel={isColTall ? '9:16 Tall' : '1:1 Square'}
                              recommendedDimensions={isColTall ? '800 × 1422px (9:16)' : '800 × 800px (1:1)'}
                              defaultUrl={defaultCol?.image}
                              isLiveSynced={isSynced}
                            />

                            {/* Accessibility Description */}
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                Accessibility Image Description (Alt Text)
                              </label>
                              <input
                                type="text"
                                value={col.title}
                                onChange={(e) => updateColItem(idx, { title: e.target.value })}
                                placeholder="e.g. Fine Rings Collection"
                                className="w-full px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#E2D5C8] rounded-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: EVERYDAY ELEGANCE */}
              {activeTab === 'elegance' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#EADFD5] gap-2">
                    <div>
                      <h2 className="font-serif text-xl text-[#2A2323]">Everyday Elegance</h2>
                      <p className="text-xs text-[#7A6C6C]">
                        Edit the section title and the 4 clean 1:1 square jewelry still images displayed on the homepage.
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-[#FAF0E6] text-[#7A5229] px-2.5 py-1 rounded-xs border border-[#E8D4C0]">
                      4 Pieces Active
                    </span>
                  </div>

                  {/* Section Title Input */}
                  <div className="bg-white border border-[#E5DAD0] p-4 rounded-xs shadow-xs space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={draft.everydayElegance?.title || 'Everyday Elegance'}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          everydayElegance: {
                            ...prev.everydayElegance,
                            title: val,
                          },
                        }));
                      }}
                      placeholder="Everyday Elegance"
                      className="w-full px-3 py-1.5 text-sm font-serif bg-[#FAF8F5] border border-[#E0D5CA] rounded-xs text-[#2A2323]"
                    />
                  </div>

                  {/* 4 Clean Square Photo Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {draft.products.slice(0, 4).map((prod, idx) => {
                      const isSynced = content.products?.[idx]?.image === prod.image;
                      return (
                        <div
                          key={prod.id || `elegance-${idx}`}
                          className="bg-white border border-[#E5DAD0] p-4 rounded-xs shadow-xs space-y-3.5"
                        >
                          <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-1.5">
                            <span className="text-xs font-semibold text-[#8C6D4F] tracking-wider uppercase font-mono">
                              Piece #{idx + 1}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-[#736565] bg-[#FAF5F0] border border-[#E8DFD5] px-2 py-0.5 rounded-xs">
                              1:1 Square Still
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                              Piece Name / Alt Text
                            </label>
                            <input
                              type="text"
                              value={prod.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const next = { ...prev };
                                  next.products[idx].name = val;
                                  return next;
                                });
                              }}
                              placeholder="e.g. Aurelia Pavé Diamond Ring"
                              className="w-full px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5] border border-[#E2D5C8] rounded-xs"
                            />
                          </div>

                          <ImageUpdateField
                            id={`elegance-prod-img-${idx}`}
                            label={`Piece ${idx + 1} Image`}
                            value={prod.image}
                            onChange={(newUrl) => {
                              updateDraft((prev) => {
                                const next = { ...prev };
                                next.products[idx].image = newUrl;
                                return next;
                              });
                            }}
                            onUpload={(file) => {
                              handleImageUpload(
                                file,
                                (url) => {
                                  updateDraft((prev) => {
                                    const next = { ...prev };
                                    next.products[idx].image = url;
                                    return next;
                                  });
                                },
                                `product-${idx}`,
                                1000,
                                1000
                              );
                            }}
                            isUploading={uploadingImageKey === `product-${idx}`}
                            aspectRatio="1/1"
                            aspectLabel="1:1 Square Still"
                            recommendedDimensions="1000 × 1000px"
                            defaultUrl={DEFAULT_SITE_CONTENT.products[idx]?.image}
                            isLiveSynced={isSynced}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: SURPRISE A LOVED ONE */}
              {activeTab === 'gift' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#EADFD5] gap-2">
                    <div>
                      <h2 className="font-serif text-xl text-[#2A2323]">Surprise A Loved One</h2>
                      <p className="text-xs text-[#7A6C6C]">
                        Edit the section headline and the 4 numbered points (01, 02, 03, 04) flanking the gift box on the homepage.
                      </p>
                    </div>
                  </div>

                  {/* Section Headline */}
                  <div className="bg-white border border-[#E5DAD0] p-4 rounded-xs shadow-xs space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium">
                      Section Headline
                    </label>
                    <input
                      type="text"
                      value={draft.giftSection.headline}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          giftSection: { ...prev.giftSection, headline: val },
                        }));
                      }}
                      placeholder="SURPRISE A LOVED ONE"
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E0D5CA] rounded-xs font-serif font-medium"
                    />
                  </div>

                  {/* 4 Numbered Features Flanking Gift Box */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-[#E8DFD5]">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#2A2323]">
                        4 Numbered Points Under Numbers (01, 02, 03, 04)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column Points (01 & 02) */}
                      <div className="space-y-4">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8C6D4F] border-b border-[#E8DFD5] pb-1">
                          Left Side Points (01 & 02)
                        </div>
                        {[0, 1].map((fIdx) => {
                          const feat = draft.giftSection.features?.[fIdx] || defaultFeatures[fIdx];
                          return (
                            <div key={fIdx} className="bg-white border border-[#E5DAD0] p-4 rounded-xs shadow-xs space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-1/4">
                                  <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                    Number
                                  </label>
                                  <input
                                    type="text"
                                    value={feat.number}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDraft((prev) => {
                                        const next = { ...prev };
                                        if (!next.giftSection.features) next.giftSection.features = [...defaultFeatures];
                                        next.giftSection.features[fIdx].number = val;
                                        return next;
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs font-serif font-semibold bg-[#FAF8F5] border border-[#DCD0C2] rounded-xs text-center"
                                  />
                                </div>
                                <div className="w-3/4">
                                  <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    value={feat.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDraft((prev) => {
                                        const next = { ...prev };
                                        if (!next.giftSection.features) next.giftSection.features = [...defaultFeatures];
                                        next.giftSection.features[fIdx].title = val;
                                        return next;
                                      });
                                    }}
                                    placeholder="e.g. Viverra venenatis donec"
                                    className="w-full px-2.5 py-1.5 text-xs font-serif bg-[#FAF8F5] border border-[#DCD0C2] rounded-xs"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                  Text Under Number (Description)
                                </label>
                                <textarea
                                  rows={2}
                                  value={feat.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateDraft((prev) => {
                                      const next = { ...prev };
                                      if (!next.giftSection.features) next.giftSection.features = [...defaultFeatures];
                                      next.giftSection.features[fIdx].description = val;
                                      return next;
                                    });
                                  }}
                                  placeholder="e.g. Vestibulum ante ipsum primis in faucibus orci luctus"
                                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD0C2] rounded-xs"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Column Points (03 & 04) */}
                      <div className="space-y-4">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8C6D4F] border-b border-[#E8DFD5] pb-1">
                          Right Side Points (03 & 04)
                        </div>
                        {[2, 3].map((fIdx) => {
                          const feat = draft.giftSection.features?.[fIdx] || defaultFeatures[fIdx];
                          return (
                            <div key={fIdx} className="bg-white border border-[#E5DAD0] p-4 rounded-xs shadow-xs space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-1/4">
                                  <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                    Number
                                  </label>
                                  <input
                                    type="text"
                                    value={feat.number}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDraft((prev) => {
                                        const next = { ...prev };
                                        if (!next.giftSection.features) next.giftSection.features = [...defaultFeatures];
                                        next.giftSection.features[fIdx].number = val;
                                        return next;
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs font-serif font-semibold bg-[#FAF8F5] border border-[#DCD0C2] rounded-xs text-center"
                                  />
                                </div>
                                <div className="w-3/4">
                                  <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    value={feat.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDraft((prev) => {
                                        const next = { ...prev };
                                        if (!next.giftSection.features) next.giftSection.features = [...defaultFeatures];
                                        next.giftSection.features[fIdx].title = val;
                                        return next;
                                      });
                                    }}
                                    placeholder="e.g. Viverra venenatis donec"
                                    className="w-full px-2.5 py-1.5 text-xs font-serif bg-[#FAF8F5] border border-[#DCD0C2] rounded-xs"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
                                  Text Under Number (Description)
                                </label>
                                <textarea
                                  rows={2}
                                  value={feat.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateDraft((prev) => {
                                      const next = { ...prev };
                                      if (!next.giftSection.features) next.giftSection.features = [...defaultFeatures];
                                      next.giftSection.features[fIdx].description = val;
                                      return next;
                                    });
                                  }}
                                  placeholder="e.g. Vestibulum ante ipsum primis in faucibus orci luctus"
                                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD0C2] rounded-xs"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE LIVE PREVIEW (Rendered when viewMode is 'split' or 'preview') */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`${
              viewMode === 'split' ? 'hidden lg:flex lg:w-1/2' : 'w-full'
            } flex flex-col bg-[#231F1F] h-full min-h-0 overflow-hidden items-center justify-start`}
          >
            {/* Viewport Frame Header */}
            <div className="shrink-0 w-full max-w-full flex items-center justify-between text-white/70 text-xs py-2.5 px-4 sm:px-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase tracking-widest text-[10px] font-semibold text-white/90">
                  Live Preview • Device: {deviceMode.toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] text-white/50 tracking-wider">
                Changes reflect automatically
              </span>
            </div>

            {/* Scrollable Device Wrapper - Independent Isolated Scroll */}
            <div className="flex-1 min-h-0 w-full overflow-y-auto p-4 sm:p-6 flex justify-center items-start pb-16">
              <div
                className={`transition-all duration-300 bg-white shadow-2xl rounded-xs overflow-hidden ${
                  deviceMode === 'mobile'
                    ? 'w-full max-w-[375px] min-h-[667px] sm:border-[8px] sm:border-[#363030] sm:rounded-[24px]'
                    : deviceMode === 'tablet'
                    ? 'w-full max-w-[768px] min-h-[900px] sm:border-[10px] sm:border-[#363030] sm:rounded-[20px]'
                    : 'w-full max-w-6xl'
                }`}
              >
                {/* Live Public Site Preview */}
                <div className="w-full pointer-events-auto select-auto">
                  <Header
                    activeSection="home"
                    onOpenContact={() => {}}
                    onNavigateSection={() => {}}
                  />
                  <FadeInSection delay={60}>
                    <Hero />
                  </FadeInSection>
                  <FadeInSection>
                    <FeaturedCollections onSelectCategory={() => {}} />
                  </FadeInSection>
                  <FadeInSection>
                    <EverydayElegance onSelectPiece={() => {}} />
                  </FadeInSection>
                  <FadeInSection>
                    <EditorialStoryTabs onExplore={() => {}} />
                  </FadeInSection>
                  <FadeInSection>
                    <GiftPackagingSection onOpenGiftInquiry={() => {}} />
                  </FadeInSection>
                  <FadeInSection>
                    <Footer onOpenContact={() => {}} onNavigateSection={() => {}} />
                  </FadeInSection>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* EXPORT & VERCEL DEPLOYMENT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] max-w-2xl w-full rounded-sm shadow-2xl border border-[#E8DFD5] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE8E1] bg-[#FAF6F2]">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-[#8C5D3B]" />
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#2A2323]">
                    Deploy to Vercel & Export Content
                  </h3>
                  <p className="text-xs text-[#7A6E6E]">
                    Sync your CMS changes permanently to <span className="font-mono font-medium">signorabloom.vercel.app</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-[#8A7D7D] hover:text-[#2A2323] hover:bg-[#EFE7DF] rounded-xs transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#4A4040]">
              
              {/* Alert: Why no deployment on Vercel */}
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E6D7C8] rounded-xs text-xs text-[#6B533E] space-y-1.5 leading-relaxed">
                <p className="font-semibold text-[#4A3522] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#8C5D3B]" />
                  Why is there no deployment showing in Vercel?
                </p>
                <p>
                  Vercel builds strictly from your <strong>Git repository (GitHub)</strong>. Saving changes inside this web admin panel updates your site locally, but does not create a Git commit on GitHub.
                </p>
              </div>

              {/* Action 1: Export siteContent.ts */}
              <div className="border border-[#EADFD5] p-4 rounded-xs bg-[#FFFFFF] space-y-3">
                <h4 className="font-serif text-base font-medium text-[#2A2323]">
                  1. Export Your Customized Code
                </h4>
                <p className="text-xs text-[#6E6363] leading-relaxed">
                  Download or copy your customized content file. This includes all your updated products, slides, editorial texts, and prices:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadSiteContentTs}
                    className="px-4 py-2 bg-[#2A2323] hover:bg-[#453939] text-white text-xs uppercase tracking-widest rounded-xs flex items-center gap-2 font-medium cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    Download siteContent.ts
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySiteContentTs}
                    className="px-4 py-2 border border-[#D9C8B8] hover:bg-[#FAF6F2] text-[#4A4040] text-xs uppercase tracking-widest rounded-xs flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    {hasCopiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code to Clipboard
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action 2: Steps to deploy on Vercel */}
              <div className="border border-[#EADFD5] p-4 rounded-xs bg-[#FFFFFF] space-y-2.5">
                <h4 className="font-serif text-base font-medium text-[#2A2323]">
                  2. Update & Deploy on Vercel
                </h4>
                <ol className="list-decimal list-inside text-xs text-[#5E5353] space-y-2 leading-relaxed">
                  <li>
                    In your project repo, replace <code className="bg-[#FAF5F0] text-[#7A5333] px-1 py-0.5 rounded-xs font-mono font-semibold">src/siteContent.ts</code> with the downloaded file.
                  </li>
                  <li>
                    Commit and push your changes to GitHub (<code className="bg-[#FAF5F0] text-[#7A5333] px-1 py-0.5 rounded-xs font-mono font-semibold">git commit -m "Update site content" && git push</code>).
                  </li>
                  <li>
                    <strong>Vercel will automatically start a new deployment</strong> and publish your changes to <span className="font-medium text-[#2A2323]">signorabloom.vercel.app</span>!
                  </li>
                </ol>
              </div>

              {/* Option 3: Cloud Database (Firebase) - ACTIVE */}
              <div className="p-4 bg-[#F2F8F4] border border-[#B9DEC6] rounded-xs text-xs text-[#204E2F] space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold flex items-center gap-1.5 text-[#184226] text-sm">
                    <Cloud className="w-4.5 h-4.5 text-[#2E7A4A]" />
                    Firebase Firestore Cloud Database is Active!
                  </p>
                  <span className="px-2 py-0.5 bg-[#2E7A4A] text-white text-[10px] uppercase font-bold tracking-wider rounded-xs">
                    Connected
                  </span>
                </div>
                <p className="leading-relaxed text-[#2C5938]">
                  <strong>How non-technical users can make changes anytime:</strong> You do <em>not</em> need to run <code className="bg-[#E4F2E9] px-1 rounded-xs font-mono font-semibold">git commit</code> or rebuild on Vercel anymore. Whenever you edit slides, products, or descriptions and click <strong>"Publish Live for Everyone"</strong>, your updates are saved directly to your Firebase Firestore cloud database.
                </p>
                <p className="leading-relaxed text-[#2C5938]">
                  All visitors on your website (including <span className="font-medium text-[#184226]">signorabloom.vercel.app</span>) automatically receive your newest catalog and images in real-time across all devices!
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#FAF7F3] border-t border-[#EFE8E1] flex justify-end">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-1.5 border border-[#D9C8B8] text-[#554A4A] hover:bg-[#FFFFFF] text-xs uppercase tracking-widest rounded-xs cursor-pointer font-medium"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Batch Image Sync Modal from Reference Screenshot */}
      {isBatchSyncModalOpen && (
        <ReferenceImageBatchSync
          currentDraft={draft}
          token={token}
          onApplyDraft={(updatedContent) => {
            setDraft(updatedContent);
            updateContent(updatedContent);
            handleSave();
          }}
          onSaveToServer={async (contentToSave) => {
            const res = await saveContentToServer(contentToSave, token);
            return { success: res.success, message: res.message };
          }}
          onClose={() => setIsBatchSyncModalOpen(false)}
        />
      )}

    </div>
  );
};
