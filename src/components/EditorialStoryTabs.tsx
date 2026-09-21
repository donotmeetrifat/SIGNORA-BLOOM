import React, { useState } from 'react';
import detailInsetImg from '../assets/images/jewelry_detail_inset_1789491793865.jpg';
import { useSiteContent } from '../context/SiteContentContext';
import { ImageWithSkeleton } from './ui/ImageWithSkeleton';
import { EditorialStorySkeleton } from './skeletons/EditorialStorySkeleton';

interface EditorialStoryTabsProps {
  onExplore?: () => void;
}

export const EditorialStoryTabs: React.FC<EditorialStoryTabsProps> = () => {
  const { content, isLoading } = useSiteContent();
  const [activeTabId, setActiveTabId] = useState('beauty-ingenuity');

  if (isLoading) {
    return <EditorialStorySkeleton />;
  }

  const rawTabs = content?.editorial?.tabs || [];
  const tabs = rawTabs.map((tab) => ({
    ...tab,
    insetDetailImage: tab.insetDetailImage || detailInsetImg,
  }));

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || {
    id: 'beauty-ingenuity',
    tabLabel: 'THE SIGNORA BLOOM EDIT',
    headline: 'The Signora Bloom Edit',
    description: 'Discover thoughtfully selected accessories designed to make everyday styling feel a little more special. From elegant jewelry to expressive finishing touches, Signora Bloom brings together pieces made for modern, effortless elegance.',
    mainImage: '/assets/images/editorial_main.jpg?v=20260920',
    insetDetailImage: '/assets/images/editorial_inset.jpg?v=20260920',
    buttonLabel: 'DISCOVER SIGNORA',
  };

  return (
    <section
      id="about"
      aria-label="Beauty and Ingenuity Editorial Story"
      className="w-full bg-[#FAF5F0] pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-28 border-t border-[#EFE8DF] relative overflow-hidden"
    >
      {/* Subtle organic wavy line background art (matching faint contour lines in reference) */}
      <div className="absolute inset-0 pointer-events-none opacity-25 select-none">
        <svg
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M-100 200 C 300 150, 600 400, 1300 250"
            stroke="#D8C8B8"
            strokeWidth="1.2"
          />
          <path
            d="M-50 450 C 400 350, 700 650, 1350 500"
            stroke="#D8C8B8"
            strokeWidth="1"
          />
          <path
            d="M100 700 C 500 550, 850 750, 1400 680"
            stroke="#D8C8B8"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Centered Tab Headers */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 md:gap-x-16 gap-y-2 mb-10 sm:mb-14 md:mb-16 border-b border-[#EADFD5]/60 pb-3">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`text-[10px] sm:text-[11px] tracking-[0.24em] uppercase py-2 px-1 min-h-[40px] flex items-center transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-[#2A2323] font-medium'
                    : 'text-[#8E8080] hover:text-[#2A2323]'
                }`}
              >
                <span>{tab.tabLabel}</span>
                {isActive && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-[1.8px] bg-[#2A2323]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content: Two Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* LEFT COLUMN: Headline, Paragraph & Rectangular Button */}
          <div className="md:col-span-6 flex flex-col justify-center text-left md:pr-6">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-normal text-[#2A2323] tracking-wide mb-4">
              {activeTab.headline}
            </h2>

            <p className="font-sans text-xs sm:text-[13px] text-[#665959] leading-relaxed max-w-lg font-light">
              {activeTab.description}
            </p>
          </div>

          {/* RIGHT COLUMN: Big image (3:4 ratio) & Small overlapping inset image (1:1 ratio) */}
          <div className="md:col-span-6 flex justify-center md:justify-end pb-6 sm:pb-10 md:pb-12">
            <div className="relative w-full max-w-[340px] sm:max-w-[390px] md:max-w-[420px] mx-auto md:ml-auto md:mr-0">
              
              {/* BIG IMAGE: Exactly 3:4 aspect ratio with luxury shimmer skeleton */}
              <div className="relative w-full aspect-[3/4] bg-[#EFE6DC] overflow-hidden rounded-xs shadow-xs">
                <ImageWithSkeleton
                  id="editorial-main-img"
                  src={activeTab.mainImage}
                  alt={`Signora Bloom editorial — ${activeTab.headline}`}
                  aspectRatio="3/4"
                  skeletonLabel="EDITORIAL ARCHIVE"
                  className="w-full h-full object-cover object-center filter contrast-[1.03] brightness-[1.01] transition-all duration-500"
                  containerClassName="w-full h-full aspect-[3/4]"
                  fallbackSrc="/assets/images/editorial_main.jpg?v=20260920"
                />
              </div>

              {/* SMALL INSET IMAGE: Exactly 1:1 aspect ratio (Square), displayed fully and cleanly on all devices */}
              <div 
                className="absolute bottom-3 left-3 sm:-bottom-6 sm:-left-6 md:-bottom-8 md:-left-8 w-24 sm:w-32 md:w-36 lg:w-40 aspect-square bg-[#FFFFFF] p-1.5 sm:p-2 shadow-[0_10px_25px_rgba(51,43,43,0.16)] z-20 rounded-xs transition-all"
              >
                <div className="w-full h-full aspect-square overflow-hidden bg-[#FAF5EE]">
                  <ImageWithSkeleton
                    id="editorial-inset-img"
                    src={activeTab.insetDetailImage}
                    alt={`Close-up craftsmanship detail of ${activeTab.tabLabel} by Signora Bloom`}
                    aspectRatio="1/1"
                    skeletonLabel="DETAIL"
                    className="w-full h-full aspect-square object-cover object-center transition-transform duration-500 hover:scale-105"
                    containerClassName="w-full h-full aspect-square"
                    fallbackSrc="/assets/images/editorial_inset.jpg?v=20260920"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
