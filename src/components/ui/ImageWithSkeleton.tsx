import React, { useState, useEffect, useRef } from 'react';
import { ImageSkeleton } from './ImageSkeleton';

export interface ImageWithSkeletonProps {
  id?: string;
  src: string;
  alt: string;
  aspectRatio?: '16/9' | '9/16' | '1/1' | '3/4' | 'auto';
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  skeletonLabel?: string;
  showSkeletonIcon?: boolean;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  id,
  src,
  alt,
  aspectRatio = 'auto',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  fallbackSrc,
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
  skeletonLabel,
  showSkeletonIcon = true,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // If the src changes, reset the loaded state unless already complete in browser cache
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && !hasError) {
      setHasError(true);
      e.currentTarget.src = fallbackSrc;
    } else {
      setIsLoaded(true); // Don't hold skeleton indefinitely on total failure
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <div
      id={id ? `${id}-container` : undefined}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {/* Skeleton Placeholder Screen */}
      <div
        className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <ImageSkeleton
          aspectRatio={aspectRatio}
          className="w-full h-full"
          showIcon={showSkeletonIcon}
          label={skeletonLabel}
        />
      </div>

      {/* Target Image with graceful smooth reveal */}
      <img
        ref={imgRef}
        id={id}
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy={referrerPolicy}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`relative z-1 transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};
