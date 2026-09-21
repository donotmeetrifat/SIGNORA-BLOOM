import React from 'react';

export interface ImageSkeletonProps {
  id?: string;
  aspectRatio?: '16/9' | '9/16' | '1/1' | '3/4' | 'auto';
  className?: string;
  showIcon?: boolean;
  pulseOnly?: boolean;
  label?: string;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  id,
  aspectRatio = 'auto',
  className = '',
  showIcon = true,
  pulseOnly = false,
  label,
}) => {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16/9':
        return 'aspect-[16/9] w-full';
      case '9/16':
        return 'aspect-[9/16] w-full';
      case '3/4':
        return 'aspect-[3/4] w-full';
      case '1/1':
        return 'aspect-square w-full';
      case 'auto':
      default:
        return '';
    }
  };

  return (
    <div
      id={id}
      aria-hidden="true"
      className={`relative select-none overflow-hidden bg-[#F4ECE3] border border-[#EADBCE]/60 rounded-xs flex items-center justify-center ${getAspectClass()} ${
        pulseOnly ? 'animate-luxury-pulse' : 'luxury-shimmer'
      } ${className}`}
    >
      {/* Luxury Jewelry Facet Emblem Silhouette */}
      {showIcon && (
        <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none opacity-30 text-[#8C6D4F]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 sm:w-7 h-6 sm:h-7"
          >
            <path d="M6 3h12l4 6-10 12L2 9z" />
            <path d="M2 9h20" />
            <path d="M10 3v6l2 12 2-12V3" />
          </svg>
          {label && (
            <span className="text-[9px] uppercase tracking-[0.2em] font-sans text-[#8C6D4F]/70">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
