import React from 'react';
import braceletsSquareImg from '../assets/images/shop_bracelets_square_1789491269438.jpg';
import { useSiteContent } from '../context/SiteContentContext';
import { ImageWithSkeleton } from './ui/ImageWithSkeleton';
import { FeaturedCollectionsSkeleton } from './skeletons/FeaturedCollectionsSkeleton';

interface FeaturedCollectionsProps {
  onSelectCategory?: (category: string) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = () => {
  const { content, isLoading } = useSiteContent();
  const collections = content?.collections || [];

  if (isLoading) {
    return <FeaturedCollectionsSkeleton />;
  }

  const colRings = collections.find((c) => c.id === 'fine-rings') || collections[0] || {
    id: 'fine-rings',
    title: 'RINGS',
    image: '/assets/images/collection_rings.jpg?v=20260920',
  };
  const colBracelets = collections.find((c) => c.id === 'sculptural-bracelets') || collections[1] || {
    id: 'sculptural-bracelets',
    title: 'BANGLES & BRACELETS',
    image: '/assets/images/collection_bangles.jpg?v=20260920',
  };
  const colNecklaces = collections.find((c) => c.id === 'medallion-necklaces') || collections[3] || {
    id: 'medallion-necklaces',
    title: 'JEWELRY',
    image: '/assets/images/collection_jewelry.jpg?v=20260920',
  };
  const colEarrings = collections.find((c) => c.id === 'drop-hoop-earrings') || collections[2] || {
    id: 'drop-hoop-earrings',
    title: 'EARRINGS',
    image: '/assets/images/collection_earrings.jpg?v=20260920',
  };
  const colCharms = collections.find((c) => c.id === 'shop-charms') || collections[4] || {
    id: 'shop-charms',
    title: "WOMEN'S ACCESSORIES",
    image: '/assets/images/collection_accessories.jpg?v=20260920',
  };

  return (
    <section 
      id="collections" 
      aria-label="Category Collections Mosaic"
      className="w-full bg-[#FFFFFF] py-10 sm:py-14 md:py-18"
    >
      {/* Visually hidden H2 for document outline and search engine indexers */}
      <h2 className="sr-only">Curated Women's Jewelry & Fashion Accessories Collections</h2>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Exact 3-Column Mosaic Grid: All columns aligned flush at top and bottom */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5 items-stretch select-none">
          
          {/* ========================================================== */}
          {/* 1. LEFT COLUMN: Image 1 -> 9:16 RATIO (4:5 on mobile)       */}
          {/* ========================================================== */}
          <figure 
            id="mosaic-rings"
            className="md:col-span-4 relative flex flex-col overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full cursor-default m-0"
          >
            <figcaption className="sr-only">Women's Rings - Curated gold and delicate statement designs</figcaption>
            {/* Aspect Ratio 9:16 on desktop, 4:5 on mobile for balanced presentation */}
            <ImageWithSkeleton
              id="mosaic-img-rings"
              src={colRings.image}
              alt="Signora Bloom gold floral and textured rings from curated collection"
              aspectRatio="9/16"
              skeletonLabel="FINE RINGS"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-102"
              containerClassName="w-full h-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[9/16]"
              fallbackSrc="/assets/images/collection_rings.jpg?v=20260920"
            />
          </figure>

          {/* ========================================================== */}
          {/* 2. MIDDLE COLUMN: Image 2 (1:1 RATIO) + Images 3 & 4       */}
          {/* Aligned flush at the bottom with Image 1 & Image 5        */}
          {/* ========================================================== */}
          <div className="md:col-span-4 flex flex-col justify-between gap-3.5 sm:gap-4 md:gap-5 h-full">
            
            {/* TOP: Image 2 -> 1:1 RATIO (SQUARE) */}
            <figure 
              id="mosaic-bracelets"
              className="relative overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs w-full aspect-square shrink-0 cursor-default m-0"
            >
              <figcaption className="sr-only">Women's Bangles and Bracelets - Sculptural stacking jewelry</figcaption>
              <ImageWithSkeleton
                id="mosaic-img-bracelets"
                src={colBracelets.image}
                alt="Signora Bloom textured gold bangles and layered women's bracelets"
                aspectRatio="1/1"
                skeletonLabel="SCULPTURAL BRACELETS"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-102"
                containerClassName="w-full h-full aspect-square"
                fallbackSrc="/assets/images/collection_bangles.jpg?v=20260920"
              />
            </figure>

            {/* BOTTOM: Images 3 & 4 side by side -> Fills remaining height to align bottom perfectly */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:gap-5 flex-1 min-h-0">
              
              {/* Image 3 */}
              <figure
                id="mosaic-necklaces"
                className="relative overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full flex flex-col cursor-default aspect-square sm:aspect-auto m-0"
              >
                <figcaption className="sr-only">Jewelry & Medallion Necklaces - Curated everyday chains and pendants</figcaption>
                <ImageWithSkeleton
                  id="mosaic-img-necklaces"
                  src={colNecklaces.image}
                  alt="Signora Bloom layered gold coin medallion necklaces and jewelry accents"
                  skeletonLabel="NECKLACES"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-102"
                  containerClassName="w-full h-full min-h-[140px] sm:min-h-[180px]"
                  fallbackSrc="/assets/images/collection_jewelry.jpg?v=20260920"
                />
              </figure>

              {/* Image 4 */}
              <figure
                id="mosaic-earrings"
                className="relative overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full flex flex-col cursor-default aspect-square sm:aspect-auto m-0"
              >
                <figcaption className="sr-only">Women's Earrings - Fluted hoops, studs, and drop accents</figcaption>
                <ImageWithSkeleton
                  id="mosaic-img-earrings"
                  src={colEarrings.image}
                  alt="Signora Bloom fluted gold hoop earrings and drop studs"
                  skeletonLabel="EARRINGS"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-102"
                  containerClassName="w-full h-full min-h-[140px] sm:min-h-[180px]"
                  fallbackSrc="/assets/images/collection_earrings.jpg?v=20260920"
                />
              </figure>

            </div>

          </div>

          {/* ========================================================== */}
          {/* 3. RIGHT COLUMN: Image 5 -> 9:16 RATIO (4:5 on mobile)      */}
          {/* ========================================================== */}
          <figure 
            id="mosaic-charms"
            className="md:col-span-4 relative flex flex-col overflow-hidden bg-[#F7F4F0] rounded-xs shadow-xs h-full cursor-default m-0"
          >
            <figcaption className="sr-only">Women's Fashion Accessories - Refined everyday styling</figcaption>
            {/* Aspect Ratio 9:16 on desktop, 4:5 on mobile for balanced presentation */}
            <ImageWithSkeleton
              id="mosaic-img-charms"
              src={colCharms.image}
              alt="Signora Bloom curated women's fashion accessories and elegant styling"
              aspectRatio="9/16"
              skeletonLabel="SHOP CHARMS"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out hover:scale-102"
              containerClassName="w-full h-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[9/16]"
              fallbackSrc="/assets/images/collection_accessories.jpg?v=20260920"
            />
          </figure>

        </div>

      </div>
    </section>
  );
};
