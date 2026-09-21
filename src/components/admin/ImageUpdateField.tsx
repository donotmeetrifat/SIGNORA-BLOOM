import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check, Copy, RotateCcw, Image as ImageIcon, ExternalLink } from 'lucide-react';

export interface ImageUpdateFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  aspectRatio?: '16/9' | '9/16' | '1/1' | '3/4' | 'auto';
  aspectLabel?: string;
  recommendedDimensions?: string;
  defaultUrl?: string;
  isLiveSynced?: boolean;
  className?: string;
}

export const ImageUpdateField: React.FC<ImageUpdateFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onUpload,
  isUploading = false,
  aspectRatio = '1/1',
  aspectLabel,
  recommendedDimensions,
  defaultUrl,
  isLiveSynced,
  className = '',
}) => {
  const [localUrl, setLocalUrl] = useState(value || '');
  const [justUpdated, setJustUpdated] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setLocalUrl(value || '');
    setImgError(false);
  }, [value]);

  const handleApplyUpdate = () => {
    const trimmed = localUrl.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyUpdate();
    }
  };

  const handleCopyUrl = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  };

  const handleResetDefault = () => {
    if (defaultUrl) {
      setLocalUrl(defaultUrl);
      onChange(defaultUrl);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2400);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16/9':
        return 'aspect-[16/9] w-32 sm:w-40';
      case '9/16':
        return 'aspect-[9/16] w-20 sm:w-24';
      case '3/4':
        return 'aspect-[3/4] w-24 sm:w-28';
      case '1/1':
      default:
        return 'aspect-square w-24 sm:w-28';
    }
  };

  const hasUnappliedUrl = localUrl.trim() !== (value || '').trim();

  return (
    <div
      id={id}
      className={`bg-[#FCFAF7] border ${
        justUpdated
          ? 'border-[#8ABF97] ring-1 ring-[#8ABF97]/40 bg-[#F4FAF6]'
          : 'border-[#E6DDD3]'
      } p-3 sm:p-4 rounded-xs transition-all space-y-3 ${className}`}
    >
      {/* Header with Title and Sync/Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EDE4DB]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-[#8C6D4F]" />
          <span className="text-xs font-semibold text-[#2A2323] tracking-wide">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {aspectLabel && (
            <span className="text-[9px] uppercase tracking-wider font-mono text-[#7A6A6A] bg-white border border-[#E0D7CD] px-1.5 py-0.5 rounded-xs">
              {aspectLabel}
            </span>
          )}

          {typeof isLiveSynced === 'boolean' && (
            <span
              className={`text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-xs flex items-center gap-1 ${
                isLiveSynced
                  ? 'bg-[#EAF5EC] text-[#256837] border border-[#BBE2C3]'
                  : 'bg-[#FDF4EA] text-[#9A6233] border border-[#EED7C3]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveSynced ? 'bg-[#2E8B47]' : 'bg-[#D4823A] animate-pulse'
                }`}
              />
              {isLiveSynced ? 'Live Synced' : 'Draft Modified'}
            </span>
          )}

          {justUpdated && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-[#1A5C28] bg-[#E2F5E6] border border-[#A4DDB0] px-2 py-0.5 rounded-xs animate-fadeIn">
              <Check className="w-2.5 h-2.5" />
              Updated ✓
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Thumbnail Preview + Edit Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Visual Thumbnail */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center">
          <div
            className={`${getAspectClass()} relative bg-[#F2ECE4] border border-[#DCD0C2] rounded-xs overflow-hidden group shadow-2xs flex items-center justify-center`}
          >
            {value && !imgError ? (
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="p-2 text-center text-[#9E9090] text-[10px] flex flex-col items-center gap-1">
                <ImageIcon className="w-5 h-5 opacity-50" />
                <span>{imgError ? 'Image load error' : 'No image URL'}</span>
              </div>
            )}

            {/* Overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium tracking-wider uppercase pointer-events-none">
              Active Preview
            </div>
          </div>

          {recommendedDimensions && (
            <span className="text-[9px] text-[#9C8F8F] font-mono mt-1 text-center">
              Rec: {recommendedDimensions}
            </span>
          )}
        </div>

        {/* Input & Action Buttons */}
        <div className="sm:col-span-8 space-y-2">
          {/* Direct URL input with Associated Update Button */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#665959] font-medium mb-1">
              Image Source URL or CDN Link
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://... or /assets/..."
                className={`flex-1 px-2.5 py-1.5 text-xs bg-white border ${
                  hasUnappliedUrl
                    ? 'border-[#C97A63] ring-1 ring-[#C97A63]/30'
                    : 'border-[#DCD0C2]'
                } rounded-xs text-[#2A2323] focus:border-[#2A2323] outline-none font-mono`}
              />

              {/* PRIMARY UPDATE / EDIT BUTTON */}
              <button
                type="button"
                onClick={handleApplyUpdate}
                disabled={isUploading}
                className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-xs cursor-pointer flex items-center gap-1 shrink-0 transition-all ${
                  hasUnappliedUrl
                    ? 'bg-[#2A2323] text-white hover:bg-[#433737] shadow-xs'
                    : justUpdated
                    ? 'bg-[#2E8B47] text-white'
                    : 'bg-[#EDE4DB] text-[#4A3E3E] hover:bg-[#DFD4C9]'
                }`}
                title="Apply changes to this image field"
              >
                <Check className="w-3 h-3" />
                <span>{justUpdated ? 'Updated' : 'Update'}</span>
              </button>
            </div>
            {hasUnappliedUrl && (
              <p className="text-[10px] text-[#C97A63] mt-0.5 font-medium">
                Click &quot;Update&quot; or press Enter to apply your URL edit.
              </p>
            )}
          </div>

          {/* Upload File and Auxiliary Action Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {/* File Upload Button */}
            <label
              className={`px-3 py-1.5 border border-[#D5C8B8] text-[10px] uppercase tracking-wider rounded-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
                isUploading
                  ? 'bg-[#EAE2D8] text-[#736565] cursor-wait'
                  : 'bg-white hover:bg-[#F3ECE4] text-[#3A3232] font-medium shadow-2xs'
              }`}
            >
              {isUploading ? (
                <div className="w-3 h-3 border-2 border-[#3A3232] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3 h-3 text-[#8C6D4F]" />
              )}
              <span>{isUploading ? 'Optimizing & Uploading...' : 'Upload Image File'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUpload(file);
                    // Reset input so same file can be uploaded again if needed
                    e.target.value = '';
                  }
                }}
              />
            </label>

            {/* Copy URL Button */}
            {value && (
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F3ECE4] border border-[#D5C8B8] text-[10px] uppercase tracking-wider text-[#635555] rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy current image URL to clipboard"
              >
                <Copy className="w-2.5 h-2.5" />
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            {/* Reset to Default Button */}
            {defaultUrl && value !== defaultUrl && (
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F3ECE4] border border-[#D5C8B8] text-[10px] uppercase tracking-wider text-[#8A5B36] rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset this image to factory default"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}

            {/* External URL Preview Link */}
            {value && (value.startsWith('http://') || value.startsWith('https://')) && (
              <a
                href={value}
                target="_blank"
                rel="noreferrer noopener"
                className="p-1.5 text-[#8A7C7C] hover:text-[#2A2323] transition-colors"
                title="Open image in new tab"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
