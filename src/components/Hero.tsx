import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import slide1Img from '../assets/images/signora_bloom_hero_banner.jpg';
import slide2Img from '../assets/images/jewelry_hero_clean_2_1789492847429.jpg';
import slide3Img from '../assets/images/jewelry_hero_clean_3_1789492876099.jpg';
import { useSiteContent } from '../context/SiteContentContext';
import { HeroSkeleton } from './skeletons/HeroSkeleton';

interface HeroProps {
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const { content, isLoading } = useSiteContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});

  // Map slide images to bundled fallback only if empty
  const rawSlides = content?.hero?.slides && content.hero.slides.length > 0
    ? content.hero.slides
    : [
        { id: 0, image: slide1Img, alt: 'Jewelry for Every Day luxury still life', headline: 'Jewelry For Every Day', buttonText: 'SHOP NOW' },
        { id: 1, image: slide2Img, alt: 'Everyday Sophistication sculpted gold bangles', headline: 'Everyday Sophistication', buttonText: 'SHOP NOW' },
        { id: 2, image: slide3Img, alt: 'Sculpted In Pure Gold coin medallion pendant', headline: 'Sculpted In Pure Gold', buttonText: 'SHOP NOW' },
      ];

  const slides = rawSlides.map((slide, idx) => {
    const fallbackImg = idx === 0 ? slide1Img : idx === 1 ? slide2Img : slide3Img;
    const finalImg = slide.image && typeof slide.image === 'string' && slide.image.trim() !== ''
      ? slide.image
      : fallbackImg;
    return {
      ...slide,
      image: finalImg,
    };
  });

  const slideCount = slides.length || 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-slide with pause on hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  // Mouse drag handler for desktop
  const mouseStartX = useRef<number | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const diff = mouseStartX.current - e.clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    mouseStartX.current = null;
  };

  if (isLoading) {
    return <HeroSkeleton />;
  }

  return (
    <section
      id="home"
      aria-label="Signora Bloom Hero Slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-full overflow-hidden bg-[#F5EFEB] border-b border-[#ECE3DA] aspect-[1376/768] flex items-center justify-center select-none"
    >
      {/* 1. SLIDES CONTAINER (Seamless photographic scenes, full 16:9 display across all devices) */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isSlideReady = !!loadedSlides[index];

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Underlying luxury shimmer skeleton while slide image is downloading/decoding */}
              {!isSlideReady && (
                <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                  <HeroSkeleton />
                </div>
              )}

              <img
                key={slide.image}
                src={slide.image}
                alt={slide.alt}
                className={`w-full h-full object-cover object-center select-none transition-opacity duration-700 ease-out ${
                  isSlideReady ? 'opacity-100' : 'opacity-0'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onLoad={() => setLoadedSlides((prev) => ({ ...prev, [index]: true }))}
                onError={() => setLoadedSlides((prev) => ({ ...prev, [index]: true }))}
              />
            </div>
          );
        })}
      </div>

      {/* 2. LEFT CIRCULAR ARROW NAVIGATION */}
      <button
        type="button"
        id="hero-slider-prev-btn"
        aria-label="Previous Slide"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-1.5 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-7 sm:w-9 md:w-10 h-7 sm:h-9 md:h-10 rounded-full border border-[#4A3F3F]/20 hover:border-[#2A2323] bg-[#FAF6F1]/90 hover:bg-[#FFFFFF] text-[#4A3F3F] hover:text-[#2A2323] flex items-center justify-center transition-all z-30 shadow-xs cursor-pointer active:scale-95 backdrop-blur-[2px]"
      >
        <ChevronLeft className="w-3.5 sm:w-4.5 md:w-5 h-3.5 sm:h-4.5 md:h-5 stroke-[1.5]" />
      </button>

      {/* 3. RIGHT CIRCULAR ARROW NAVIGATION */}
      <button
        type="button"
        id="hero-slider-next-btn"
        aria-label="Next Slide"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-1.5 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 w-7 sm:w-9 md:w-10 h-7 sm:h-9 md:h-10 rounded-full border border-[#4A3F3F]/20 hover:border-[#2A2323] bg-[#FAF6F1]/90 hover:bg-[#FFFFFF] text-[#4A3F3F] hover:text-[#2A2323] flex items-center justify-center transition-all z-30 shadow-xs cursor-pointer active:scale-95 backdrop-blur-[2px]"
      >
        <ChevronRight className="w-3.5 sm:w-4.5 md:w-5 h-3.5 sm:h-4.5 md:h-5 stroke-[1.5]" />
      </button>

      {/* 4. SLIDER PAGINATION DOTS AT THE BOTTOM OF THE SECTION */}
      <div 
        className="absolute bottom-1 sm:bottom-3 md:bottom-5 left-0 right-0 z-20 flex items-center justify-center space-x-1 sm:space-x-2 text-[#2A2323]"
        role="tablist"
        aria-label="Slide Pagination"
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${index + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className="cursor-pointer p-1.5 sm:p-2 group flex items-center justify-center transition-transform hover:scale-110 min-w-[28px] min-h-[28px]"
            >
              {isActive ? (
                /* Active Dot: Elegant Outer Ring with Solid Center Dot */
                <span className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full border border-[#2A2323] flex items-center justify-center transition-all bg-white/70 backdrop-blur-[2px]">
                  <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#2A2323]" />
                </span>
              ) : (
                /* Inactive Dot */
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#4A3F3F]/40 group-hover:bg-[#2A2323] transition-colors shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
