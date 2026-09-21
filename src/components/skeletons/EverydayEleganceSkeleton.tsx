import React from 'react';
import { ImageSkeleton } from '../ui/ImageSkeleton';

export const EverydayEleganceSkeleton: React.FC = () => {
  return (
    <div
      aria-label="Loading Everyday Elegance Collection"
      className="w-full bg-[#FFFFFF] py-12 sm:py-16 md:py-20 select-none"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading Skeleton */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-14">
          <div className="h-8 sm:h-9 md:h-10 w-48 sm:w-64 bg-[#F2ECE4] rounded-xs luxury-shimmer mb-2" />
          <div className="h-2.5 w-28 bg-[#F5EFEB] rounded-xs luxury-shimmer" />
        </div>

        {/* 4 Square Items Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={`elegance-skel-${idx}`}
              className="relative aspect-square bg-[#F7F4F0] overflow-hidden rounded-xs"
            >
              <ImageSkeleton
                aspectRatio="1/1"
                className="w-full h-full"
                label={`PIECE 0${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
