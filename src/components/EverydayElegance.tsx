import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { ImageWithSkeleton } from './ui/ImageWithSkeleton';
import { EverydayEleganceSkeleton } from './skeletons/EverydayEleganceSkeleton';

interface EverydayEleganceProps {
  onSelectPiece?: (piece: any) => void;
}

export const EverydayElegance: React.FC<EverydayEleganceProps> = () => {
  const { content, isLoading } = useSiteContent();
  const products = (content?.products || []).slice(0, 4);

  if (isLoading) {
    return <EverydayEleganceSkeleton />;
  }

  return (
    <section
      id="everyday-elegance"
      aria-label="Everyday Elegance Collection"
      className="w-full bg-[#FFFFFF] py-12 sm:py-16 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Serif Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[38px] font-normal text-[#2A2323] tracking-wide">
            {content?.everydayElegance?.title || 'Everyday Elegance'}
          </h2>
        </div>

        {/* 4 Square Items Row: Completely clean images without any badges, discount text, boxes, or links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {products.map((item, idx) => (
            <article
              key={item.id}
              className="relative aspect-square bg-[#F7F4F0] overflow-hidden select-none cursor-default"
            >
              <h3 className="sr-only">{item.name} — {item.categoryLabel}</h3>
              {/* Product Image with high-end skeleton placeholder */}
              <ImageWithSkeleton
                id={`product-elegance-img-${idx}`}
                src={item.image}
                alt={`${item.name} — ${item.tagline || item.categoryLabel} from Signora Bloom`}
                aspectRatio="1/1"
                skeletonLabel={`PIECE 0${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-102"
                containerClassName="w-full h-full aspect-square"
                fallbackSrc={item.image}
              />
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

