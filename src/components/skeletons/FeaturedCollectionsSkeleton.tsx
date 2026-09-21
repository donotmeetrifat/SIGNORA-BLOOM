import React from 'react';
import { ImageSkeleton } from '../ui/ImageSkeleton';

export const FeaturedCollectionsSkeleton: React.FC = () => {
  return (
    <div
      aria-label="Loading Collections Mosaic"
      className="w-full bg-[#FFFFFF] py-10 sm:py-14 md:py-18 select-none"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5 items-stretch">
          {/* Column 1: 9:16 Tall Card Skeleton */}
          <div className="md:col-span-4 relative flex flex-col overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full">
            <ImageSkeleton
              aspectRatio="9/16"
              className="w-full h-full min-h-[380px] sm:min-h-[480px]"
              label="FINE RINGS"
            />
          </div>

          {/* Column 2: 1:1 Square + Split Row */}
          <div className="md:col-span-4 flex flex-col justify-between gap-3 sm:gap-4 h-full">
            {/* Top 1:1 Square */}
            <div className="relative overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs w-full aspect-square shrink-0">
              <ImageSkeleton
                aspectRatio="1/1"
                className="w-full h-full"
                label="SCULPTURAL BRACELETS"
              />
            </div>

            {/* Bottom 2 Split Boxes */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0">
              <div className="relative overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full min-h-[140px] sm:min-h-[180px]">
                <ImageSkeleton
                  aspectRatio="auto"
                  className="w-full h-full"
                  label="NECKLACES"
                />
              </div>
              <div className="relative overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full min-h-[140px] sm:min-h-[180px]">
                <ImageSkeleton
                  aspectRatio="auto"
                  className="w-full h-full"
                  label="EARRINGS"
                />
              </div>
            </div>
          </div>

          {/* Column 3: 9:16 Tall Card Skeleton */}
          <div className="md:col-span-4 relative flex flex-col overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full">
            <ImageSkeleton
              aspectRatio="9/16"
              className="w-full h-full min-h-[380px] sm:min-h-[480px]"
              label="SHOP CHARMS"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
