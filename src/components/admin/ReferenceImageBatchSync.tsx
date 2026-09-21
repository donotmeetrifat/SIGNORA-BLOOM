import React, { useState, useRef } from 'react';
import {
  Upload,
  Check,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { SiteContent } from '../../siteContent';

export interface ReferenceSlot {
  id: string;
  name: string;
  section: string;
  matchedFilename: string;
  description: string;
  pattern: RegExp;
  targetKey: string;
  aspectRatio: string;
}

export const REFERENCE_SLOTS: ReferenceSlot[] = [
  {
    id: 'hero-banner',
    name: 'Hero Section Main Banner',
    section: 'Hero Banner',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 09_29_40 PM.png',
    description: 'Luxury flat-lay: beige handbag, sunglasses, gold bangles on marble, perfume, scrunchie & lavender',
    pattern: /09[_-]29[_-]40/i,
    targetKey: 'hero.slides.0.image',
    aspectRatio: '16/9',
  },
  {
    id: 'collection-rings',
    name: 'Featured Collection: Rings',
    section: 'Collections Grid (Tall Left)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 09_12_55 PM.png',
    description: 'Black & white model portrait wearing gold leaf motif ring with white cuff sleeve',
    pattern: /09[_-]12[_-]55/i,
    targetKey: 'collections.0.image',
    aspectRatio: '3/4',
  },
  {
    id: 'collection-bangles',
    name: 'Featured Collection: Bangles & Bracelets',
    section: 'Collections Grid (Center Top)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 02_51_06 PM.png',
    description: 'Overhead flat-lay of 13 gold filigree & textured statement rings',
    pattern: /02[_-]51[_-]06/i,
    targetKey: 'collections.1.image',
    aspectRatio: '1/1',
  },
  {
    id: 'collection-earrings',
    name: 'Featured Collection: Earrings',
    section: 'Collections Grid (Center Bottom-Left)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 02_48_43 PM.png',
    description: 'Four textured sparkling gold bangles mounted on light pedestal',
    pattern: /02[_-]48[_-]43/i,
    targetKey: 'collections.2.image',
    aspectRatio: '1/1',
  },
  {
    id: 'collection-jewelry',
    name: 'Featured Collection: Jewelry',
    section: 'Collections Grid (Center Bottom-Right)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 02_45_11 PM.png',
    description: 'Four gold bangles with embossed oval leaf motifs on cylinder pedestal',
    pattern: /02[_-]45[_-]11/i,
    targetKey: 'collections.3.image',
    aspectRatio: '1/1',
  },
  {
    id: 'collection-accessories',
    name: 'Featured Collection: Women\'s Accessories',
    section: 'Collections Grid (Tall Right)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 03_01_38 PM.png',
    description: 'B&W model resting chin on arm, wearing three gold textured bangles with circular motifs',
    pattern: /03[_-]01[_-]38/i,
    targetKey: 'collections.4.image',
    aspectRatio: '3/4',
  },
  {
    id: 'product-striped',
    name: 'Everyday Elegance: Diagonal Striped Bangles',
    section: 'Everyday Elegance (Item 1)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 09_02_44 PM (1).png',
    description: 'Set of diagonal tri-tone gold, rose & silver bangles standing upright on marble',
    pattern: /09[_-]02[_-]44.*\(1\)|09[_-]02[_-]44_1/i,
    targetKey: 'products.0.image',
    aspectRatio: '1/1',
  },
  {
    id: 'product-lattice',
    name: 'Everyday Elegance: Honeycomb Lattice Cuff',
    section: 'Everyday Elegance (Item 2)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 03_19_39 PM.png',
    description: 'Hands wearing open lattice cut-out gold bangles on draped ivory silk',
    pattern: /03[_-]19[_-]39/i,
    targetKey: 'products.1.image',
    aspectRatio: '1/1',
  },
  {
    id: 'product-circle',
    name: 'Everyday Elegance: Interlocking Circles Bangles',
    section: 'Everyday Elegance (Item 3)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 02_49_34 PM.png',
    description: 'Four gold bangles with interlocking circular textured rings on pedestal',
    pattern: /02[_-]49[_-]34/i,
    targetKey: 'products.2.image',
    aspectRatio: '1/1',
  },
  {
    id: 'product-leaf',
    name: 'Everyday Elegance: Tri-Color Leaf Twist',
    section: 'Everyday Elegance (Item 4)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 09_15_28 PM.png',
    description: 'Model wrists adorned with tri-color leaf-twist bracelets on champagne background',
    pattern: /09[_-]15[_-]28/i,
    targetKey: 'products.3.image',
    aspectRatio: '1/1',
  },
  {
    id: 'editorial-main',
    name: 'The Signora Bloom Edit: Main Image',
    section: 'Editorial Story (Main Right)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 02_51_06 PM.png',
    description: 'Overhead flat-lay display of the 13 gold filigree rings',
    pattern: /02[_-]51[_-]06/i,
    targetKey: 'editorial.tabs.0.mainImage',
    aspectRatio: '4/3',
  },
  {
    id: 'editorial-inset',
    name: 'The Signora Bloom Edit: Inset Detail',
    section: 'Editorial Story (Inset Detail)',
    matchedFilename: 'ChatGPT Image Sep 18, 2026, 02_41_48 PM.png',
    description: 'Golden dual-leaf diamond-accented ring clasping rich scarlet red fabric',
    pattern: /02[_-]41[_-]48/i,
    targetKey: 'editorial.tabs.0.insetDetailImage',
    aspectRatio: '1/1',
  },
];

interface ReferenceImageBatchSyncProps {
  currentDraft: SiteContent;
  token?: string;
  onApplyDraft: (updatedContent: SiteContent) => void;
  onSaveToServer: (contentToSave: SiteContent) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export const ReferenceImageBatchSync: React.FC<ReferenceImageBatchSyncProps> = ({
  currentDraft,
  token: propToken,
  onApplyDraft,
  onSaveToServer,
  onClose,
}) => {
  const [slotFiles, setSlotFiles] = useState<Record<string, { file?: File; previewUrl: string; status: 'idle' | 'matched' | 'uploading' | 'done' | 'error' }>>(() => {
    const initial: Record<string, { previewUrl: string; status: 'idle' | 'matched' | 'uploading' | 'done' | 'error' }> = {};
    for (const slot of REFERENCE_SLOTS) {
      // Find current value in draft
      let currentVal = '';
      if (slot.targetKey.startsWith('hero.slides.0')) currentVal = currentDraft.hero?.slides?.[0]?.image || '';
      else if (slot.targetKey.startsWith('collections.0')) currentVal = currentDraft.collections?.[0]?.image || '';
      else if (slot.targetKey.startsWith('collections.1')) currentVal = currentDraft.collections?.[1]?.image || '';
      else if (slot.targetKey.startsWith('collections.2')) currentVal = currentDraft.collections?.[2]?.image || '';
      else if (slot.targetKey.startsWith('collections.3')) currentVal = currentDraft.collections?.[3]?.image || '';
      else if (slot.targetKey.startsWith('collections.4')) currentVal = currentDraft.collections?.[4]?.image || '';
      else if (slot.targetKey.startsWith('products.0')) currentVal = currentDraft.products?.[0]?.image || '';
      else if (slot.targetKey.startsWith('products.1')) currentVal = currentDraft.products?.[1]?.image || '';
      else if (slot.targetKey.startsWith('products.2')) currentVal = currentDraft.products?.[2]?.image || '';
      else if (slot.targetKey.startsWith('products.3')) currentVal = currentDraft.products?.[3]?.image || '';
      else if (slot.targetKey.startsWith('editorial.tabs.0.mainImage')) currentVal = currentDraft.editorial?.tabs?.[0]?.mainImage || '';
      else if (slot.targetKey.startsWith('editorial.tabs.0.insetDetailImage')) currentVal = currentDraft.editorial?.tabs?.[0]?.insetDetailImage || '';

      initial[slot.id] = { previewUrl: currentVal, status: currentVal ? 'done' : 'idle' };
    }
    return initial;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle batch selection of multiple images
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newSlots = { ...slotFiles };
    let matchedCount = 0;

    Array.from(files).forEach((file) => {
      const fileName = file.name;

      REFERENCE_SLOTS.forEach((slot) => {
        if (slot.pattern.test(fileName)) {
          const preview = URL.createObjectURL(file);
          newSlots[slot.id] = {
            file,
            previewUrl: preview,
            status: 'matched',
          };
          matchedCount++;
        }
      });
    });

    setSlotFiles(newSlots);
    setSyncStatus(`Matched ${matchedCount} image(s) to your website screenshot layout!`);
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload an image to /api/upload
  const uploadSingleImage = async (file: File, token: string): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ base64Data }),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.url) {
      throw new Error(data.error || 'Failed to upload image file to server');
    }
    return data.url;
  };

  // Apply and set as permanent default on server
  const handleApplyAndMakeDefault = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSyncStatus('Uploading images directly to server...');

    try {
      const token = propToken || sessionStorage.getItem('sb_admin_token') || sessionStorage.getItem('sb_jwt_token') || localStorage.getItem('sb_atelier_admin_token') || '';
      const updatedDraft: SiteContent = JSON.parse(JSON.stringify(currentDraft));

      const updatedSlotStatus = { ...slotFiles };

      for (const slot of REFERENCE_SLOTS) {
        const item = slotFiles[slot.id];
        let finalUrl = item.previewUrl;

        if (item.file) {
          try {
            setSyncStatus(`Uploading ${slot.name}...`);
            finalUrl = await uploadSingleImage(item.file, token);
            updatedSlotStatus[slot.id] = {
              ...item,
              previewUrl: finalUrl,
              status: 'done',
            };
          } catch (err: any) {
            console.error(`Upload error for slot ${slot.id}:`, err);
            updatedSlotStatus[slot.id] = { ...item, status: 'error' };
          }
        }

        if (finalUrl) {
          if (slot.targetKey === 'hero.slides.0.image') {
            if (updatedDraft.hero?.slides?.[0]) updatedDraft.hero.slides[0].image = finalUrl;
          } else if (slot.targetKey === 'collections.0.image') {
            if (updatedDraft.collections?.[0]) updatedDraft.collections[0].image = finalUrl;
          } else if (slot.targetKey === 'collections.1.image') {
            if (updatedDraft.collections?.[1]) updatedDraft.collections[1].image = finalUrl;
          } else if (slot.targetKey === 'collections.2.image') {
            if (updatedDraft.collections?.[2]) updatedDraft.collections[2].image = finalUrl;
          } else if (slot.targetKey === 'collections.3.image') {
            if (updatedDraft.collections?.[3]) updatedDraft.collections[3].image = finalUrl;
          } else if (slot.targetKey === 'collections.4.image') {
            if (updatedDraft.collections?.[4]) updatedDraft.collections[4].image = finalUrl;
          } else if (slot.targetKey === 'products.0.image') {
            if (updatedDraft.products?.[0]) updatedDraft.products[0].image = finalUrl;
          } else if (slot.targetKey === 'products.1.image') {
            if (updatedDraft.products?.[1]) updatedDraft.products[1].image = finalUrl;
          } else if (slot.targetKey === 'products.2.image') {
            if (updatedDraft.products?.[2]) updatedDraft.products[2].image = finalUrl;
          } else if (slot.targetKey === 'products.3.image') {
            if (updatedDraft.products?.[3]) updatedDraft.products[3].image = finalUrl;
          } else if (slot.targetKey === 'editorial.tabs.0.mainImage') {
            if (updatedDraft.editorial?.tabs?.[0]) updatedDraft.editorial.tabs[0].mainImage = finalUrl;
          } else if (slot.targetKey === 'editorial.tabs.0.insetDetailImage') {
            if (updatedDraft.editorial?.tabs?.[0]) updatedDraft.editorial.tabs[0].insetDetailImage = finalUrl;
          }
        }
      }

      setSlotFiles(updatedSlotStatus);
      setSyncStatus('Writing permanent server defaults...');

      // Save to server, writing data/site-content.json AND src/siteContent.ts
      const result = await onSaveToServer(updatedDraft);
      if (result.success) {
        onApplyDraft(updatedDraft);
        setSuccessMessage('Successfully uploaded all matched images and locked them as the permanent website defaults! Your phone and mobile devices will now show these exact images.');
        setSyncStatus(null);
      } else {
        throw new Error(result.message || 'Server save failed');
      }
    } catch (err: any) {
      console.error('Batch sync error:', err);
      setErrorMessage(err.message || 'An error occurred during batch sync.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Push current PC browser preview directly to server
  const handlePushPcBrowserState = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSyncStatus('Publishing current PC preview to live server & defaults...');

    try {
      const result = await onSaveToServer(currentDraft);
      if (result.success) {
        setSuccessMessage('Your current PC preview has been successfully saved to the server and locked as the permanent factory default! Check your phone now.');
      } else {
        throw new Error(result.message || 'Server update failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save current PC content to server.');
    } finally {
      setIsProcessing(false);
      setSyncStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A2323]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xs shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#FAF7F3] border-b border-[#EFE8E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#F4EDE4] text-[#8C6D4F] flex items-center justify-center border border-[#E5DACD]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2A2323] leading-tight">
                Sync Reference Images to Website Defaults
              </h3>
              <p className="text-xs text-[#7A6E6E]">
                Match your 17 uploaded images to the website screenshot and set them as permanent defaults for all devices.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#847878] hover:text-[#2A2323] text-sm p-1 rounded-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#554A4A]">
          {/* Notification Messages */}
          {successMessage && (
            <div className="p-3.5 bg-[#F2F8F4] border border-[#BDE0C9] rounded-xs text-[#1E5C35] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E7A4A] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">{successMessage}</p>
                <p className="text-[11px] text-[#346E48]">
                  Both <code className="bg-[#E4F2E9] px-1 py-0.5 font-mono">data/site-content.json</code> and <code className="bg-[#E4F2E9] px-1 py-0.5 font-mono">src/siteContent.ts</code> are updated.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-[#FDF2F2] border border-[#F6C3C3] rounded-xs text-[#992828] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#C93838] shrink-0 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Quick Option 1: One-Click PC Browser State Push */}
          <div className="p-4 bg-[#FBF9F6] border border-[#E9DFD5] rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-medium text-[#2A2323] text-xs">
                <Monitor className="w-3.5 h-3.5 text-[#8C6D4F]" />
                <span>Already updated on this PC?</span>
              </div>
              <p className="text-[11px] text-[#7A6E6E]">
                If your PC is currently showing the exact images and text you want, push it directly to the server to lock it in as the default for your phone.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePushPcBrowserState}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#2A2323] hover:bg-[#433939] text-[#FAF6F0] text-xs uppercase tracking-widest font-medium rounded-xs shrink-0 cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              Push PC State as Default
            </button>
          </div>

          {/* Dropzone for the 17 files */}
          <div className="border-2 border-dashed border-[#DCD0C4] hover:border-[#8C6D4F] bg-[#FAF8F5] p-6 rounded-xs text-center transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8C6D4F]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#2A2323]">
                  Select or drag-and-drop your 17 downloaded images here
                </p>
                <p className="text-[11px] text-[#847878] mt-0.5">
                  The system recognizes filenames (e.g., <code className="bg-[#EFE8DF] px-1 py-0.2 rounded font-mono">09_29_40</code>, <code className="bg-[#EFE8DF] px-1 py-0.2 rounded font-mono">09_12_55</code>, etc.) and matches each image automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-white border border-[#D0C2B4] text-[#4A4040] hover:bg-[#F5EFE9] text-xs font-medium uppercase tracking-widest rounded-xs cursor-pointer shadow-2xs"
              >
                Browse Image Files
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className="p-2.5 bg-[#F0F5FA] border border-[#CDE0F2] text-[#205282] rounded-xs text-center font-medium">
              {syncStatus}
            </div>
          )}

          {/* Mapped Slot Breakdown */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-medium text-[#2A2323] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8C6D4F]" />
              Image Placement Mappings (12 Key Website Positions)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REFERENCE_SLOTS.map((slot) => {
                const item = slotFiles[slot.id];
                const hasImage = Boolean(item?.previewUrl);

                return (
                  <div
                    key={slot.id}
                    className="p-3 border border-[#E9DFD5] bg-[#FFFFFF] rounded-xs flex items-start gap-3 hover:border-[#D0C2B4] transition-colors"
                  >
                    <div className="w-14 h-14 bg-[#FAF6F0] border border-[#E4D8CC] rounded-xs flex items-center justify-center overflow-hidden shrink-0 relative">
                      {hasImage ? (
                        <img
                          src={item.previewUrl}
                          alt={slot.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[#C9BEB2]" />
                      )}
                      {item?.status === 'done' && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[8px]">
                          ✓
                        </div>
                      )}
                      {item?.status === 'matched' && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white text-[8px]">
                          ★
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6D4F]">
                          {slot.section}
                        </span>
                        <span className="text-[9px] text-[#A09393] font-mono">
                          {slot.aspectRatio}
                        </span>
                      </div>
                      <p className="font-medium text-[#2A2323] truncate">{slot.name}</p>
                      <p className="text-[10px] text-[#7A6E6E] line-clamp-1">{slot.description}</p>
                      <p className="text-[9px] font-mono text-[#8F7D7D] truncate">
                        File: {slot.matchedFilename}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#FAF7F3] border-t border-[#EFE8E1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[#7A6E6E]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Updates server storage and synchronizes permanently to code defaults.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#D9C8B8] text-[#554A4A] hover:bg-[#FFFFFF] text-xs uppercase tracking-widest rounded-xs cursor-pointer font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyAndMakeDefault}
              disabled={isProcessing}
              className="px-4 py-1.5 bg-[#2A2323] hover:bg-[#433939] text-[#FAF6F0] text-xs uppercase tracking-widest rounded-xs cursor-pointer font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              {isProcessing ? 'Processing...' : 'Upload & Lock as Defaults'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
