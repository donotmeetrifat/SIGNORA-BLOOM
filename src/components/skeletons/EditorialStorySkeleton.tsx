import React from 'react';
import { ImageSkeleton } from '../ui/ImageSkeleton';

export const EditorialStorySkeleton: React.FC = () => {
  return (
    <div
      aria-label="Loading Editorial Story"
      className="w-full bg-[#FAF5F0] pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-28 border-t border-[#EFE8DF] relative overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Tab Headers Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-16 mb-12 sm:mb-16 border-b border-[#EADFD5]/60 pb-3">
          <div className="h-4 w-32 bg-[#EADFD5] rounded-xs luxury-shimmer" />
          <div className="h-4 w-28 bg-[#EADFD5]/70 rounded-xs luxury-shimmer" />
          <div className="h-4 w-24 bg-[#EADFD5]/50 rounded-xs luxury-shimmer" />
        </div>

        {/* Tab Content: Two Column Split Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Column: Text & CTA */}
          <div className="md:col-span-6 flex flex-col justify-center text-left md:pr-6 space-y-4">
            <div className="h-8 sm:h-10 w-3/4 bg-[#E8DFD5] rounded-xs luxury-shimmer" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-[#EFE8DF] rounded-xs luxury-shimmer" />
              <div className="h-3 w-5/6 bg-[#EFE8DF] rounded-xs luxury-shimmer" />
              <div className="h-3 w-4/6 bg-[#EFE8DF] rounded-xs luxury-shimmer" />
            </div>
          </div>

          {/* Right Column: 3:4 Main Image & 1:1 Inset Detail */}
          <div className="md:col-span-6 flex justify-center md:justify-end pb-6 sm:pb-10 md:pb-12">
            <div className="relative w-full max-w-[340px] sm:max-w-[390px] md:max-w-[420px] mx-auto md:ml-auto md:mr-0">
              {/* Main 3:4 Image Skeleton */}
              <div className="relative w-full aspect-[3/4] bg-[#EFE6DC] overflow-hidden rounded-xs shadow-xs">
                <ImageSkeleton
                  aspectRatio="3/4"
                  className="w-full h-full"
                  label="EDITORIAL ARCHIVE"
                />
              </div>

              {/* Inset 1:1 Image Skeleton */}
              <div className="absolute bottom-3 left-3 sm:-bottom-6 sm:-left-6 md:-bottom-8 md:-left-8 w-24 sm:w-32 md:w-36 lg:w-40 aspect-square bg-[#FFFFFF] p-1.5 sm:p-2 shadow-[0_10px_25px_rgba(51,43,43,0.16)] z-20 rounded-xs">
                <div className="w-full h-full aspect-square overflow-hidden bg-[#FAF5EE]">
                  <ImageSkeleton
                    aspectRatio="1/1"
                    className="w-full h-full"
                    label="DETAIL"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
