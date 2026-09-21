import React from 'react';

export const HeroSkeleton: React.FC = () => {
  return (
    <div
      aria-label="Loading Hero Slider"
      className="relative w-full overflow-hidden bg-[#F5EFEB] border-b border-[#ECE3DA] aspect-[1376/768] flex items-center justify-center select-none luxury-shimmer"
    >
      {/* Background atelier watermark */}
      <div className="flex flex-col items-center justify-center gap-3 opacity-30 text-[#8C6D4F]">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 sm:w-14 h-10 sm:h-14"
        >
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M2 9h20" />
          <path d="M10 3v6l2 12 2-12V3" />
        </svg>
        <div className="h-3 w-32 sm:w-44 bg-[#E2D5C8]/70 rounded-xs" />
        <div className="h-2 w-20 sm:w-28 bg-[#E2D5C8]/50 rounded-xs" />
      </div>

      {/* Left Circular Navigation Placeholder */}
      <div className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-7 sm:w-9 md:w-10 h-7 sm:h-9 md:h-10 rounded-full border border-[#D5C7B8]/40 bg-[#FAF6F1]/60" />

      {/* Right Circular Navigation Placeholder */}
      <div className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 w-7 sm:w-9 md:w-10 h-7 sm:h-9 md:h-10 rounded-full border border-[#D5C7B8]/40 bg-[#FAF6F1]/60" />

      {/* Slider Pagination Dots Placeholder at bottom */}
      <div className="absolute bottom-2.5 sm:bottom-4 md:bottom-6 left-0 right-0 z-20 flex items-center justify-center space-x-2.5 sm:space-x-3">
        <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border border-[#D5C7B8] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#B89B82]" />
        </div>
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#D5C7B8]/70" />
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#D5C7B8]/70" />
      </div>
    </div>
  );
};
