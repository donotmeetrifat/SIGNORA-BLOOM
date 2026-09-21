import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';

interface GiftPackagingSectionProps {
  onOpenGiftInquiry?: () => void;
}

export const GiftPackagingSection: React.FC<GiftPackagingSectionProps> = ({ onOpenGiftInquiry }) => {
  const { content } = useSiteContent();
  const gift = content?.giftSection;

  const defaultFeatures = [
    { number: '01', title: 'CURATED WITH CARE', description: "A thoughtfully selected collection of women's accessories." },
    { number: '02', title: 'EFFORTLESS STYLE', description: 'Pieces designed to complement everyday fashion.' },
    { number: '03', title: 'BEAUTIFUL DETAILS', description: 'Intricate textures, elegant finishes and feminine designs.' },
    { number: '04', title: 'VERSATILE ACCESSORIES', description: 'Easy-to-style pieces for different looks and occasions.' },
  ];

  const features = gift?.features && gift.features.length > 0 ? gift.features : defaultFeatures;
  const f1 = features[0] || defaultFeatures[0];
  const f2 = features[1] || defaultFeatures[1];
  const f3 = features[2] || defaultFeatures[2];
  const f4 = features[3] || defaultFeatures[3];
  const headline = gift?.headline || 'WHY SIGNORA BLOOM';

  return (
    <section
      id="gift-packaging"
      aria-label="Why Signora Bloom Curated Accessories"
      className="w-full bg-[#826D5C] text-white pt-14 sm:pt-20 md:pt-24 pb-0 relative overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* TOP: Geometric Crown Icon & Headline (Exact to reference) */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12">
          
          {/* Geometric Crown Line-Art Icon */}
          <div className="mb-3.5 sm:mb-4 text-white/90">
            <svg
              aria-hidden="true"
              width="38"
              height="30"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 sm:w-10 h-7 sm:h-8 stroke-white stroke-[1.2]"
            >
              {/* Top diamond finial */}
              <path d="M18 1.5 L21.5 5.5 L18 9.5 L14.5 5.5 Z" />
              {/* Outer faceted crown silhouette */}
              <path d="M4 11 L18 1.5 L32 11 L27 25 L9 25 Z" />
              {/* Internal geometric facet lines */}
              <path d="M4 11 L18 16 L32 11" />
              <path d="M18 9.5 L18 25" />
              <path d="M9 25 L18 16 L27 25" />
            </svg>
          </div>

          {/* Heading: SURPRISE A LOVED ONE */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-normal tracking-[0.2em] leading-snug uppercase text-white max-w-md px-2">
            {headline}
          </h2>
        </div>

        {/* ========================================================= */}
        {/* MAIN: 3-Column Layout with Massive Square Box Center      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-end justify-center max-w-6xl mx-auto">
          
          {/* ------------------------------------------------------- */}
          {/* LEFT COLUMN: Points 01 & 02 (flanking upper and lower)  */}
          {/* ------------------------------------------------------- */}
          <div className="order-2 md:order-1 md:col-span-3 flex flex-col justify-between pb-8 sm:pb-14 md:pb-20 gap-10 sm:gap-16 md:gap-24 text-center md:text-right">
            
            {/* Feature 01 (Upper) */}
            <div className="flex flex-col items-center md:items-end px-2">
              <span className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white/90 font-light mb-1.5 tracking-wide">
                {f1.number}
              </span>
              <h3 className="font-serif text-sm sm:text-base lg:text-lg font-normal text-white mb-1.5 tracking-wide">
                {f1.title}
              </h3>
              <p className="font-sans text-[11px] sm:text-xs text-white/75 leading-relaxed max-w-[240px] md:max-w-[220px] font-light">
                {f1.description}
              </p>
            </div>

            {/* Feature 02 (Lower) */}
            <div className="flex flex-col items-center md:items-end px-2">
              <span className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white/90 font-light mb-1.5 tracking-wide">
                {f2.number}
              </span>
              <h3 className="font-serif text-sm sm:text-base lg:text-lg font-normal text-white mb-1.5 tracking-wide">
                {f2.title}
              </h3>
              <p className="font-sans text-[11px] sm:text-xs text-white/75 leading-relaxed max-w-[240px] md:max-w-[220px] font-light">
                {f2.description}
              </p>
            </div>

          </div>

          {/* ------------------------------------------------------- */}
          {/* CENTER: Extra-Large Square Gift Box Cut Flush at Bottom */}
          {/* ------------------------------------------------------- */}
          <div className="order-1 md:order-2 md:col-span-6 flex justify-center items-end w-full px-2 sm:px-0">
            <div
              aria-label="Signature Gift Box"
              className="relative w-full max-w-[290px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[530px] aspect-square select-none cursor-default rounded-t-[5px] rounded-b-none overflow-hidden"
              style={{
                /* Soft, subtle ambient shadow matching high-end editorial lighting */
                boxShadow:
                  '0 -6px 24px -4px rgba(20, 14, 10, 0.18), -8px -4px 28px -4px rgba(20, 14, 10, 0.14), 8px -4px 28px -4px rgba(20, 14, 10, 0.14)',
              }}
            >
              {/* 1. Diagonal Crimson and Charcoal Black Striped Paper */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #7A1C25 0px, #7A1C25 28px, #1D1B1E 28px, #1D1B1E 56px)',
                }}
              />

              {/* 2. Paper grain, soft overhead lighting and depth vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 40% 25%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.22) 100%)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), inset 1px 0 1.5px rgba(255,255,255,0.1), inset -1px 0 1.5px rgba(0,0,0,0.2)',
                }}
              />

              {/* 3. Subtle fine paper ribbed texture overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                }}
              />

              {/* 4. White Twine Strings tied around the box */}
              {/* Horizontal Twine Line */}
              <div
                className="absolute left-0 right-0 top-[26%] h-[2.5px] bg-[#FAF5EE]"
                style={{
                  boxShadow: '0 1.5px 3px rgba(0,0,0,0.25)',
                }}
              />

              {/* Vertical Twine Line */}
              <div
                className="absolute top-0 bottom-0 left-[26%] w-[2.5px] bg-[#FAF5EE]"
                style={{
                  boxShadow: '1.5px 0 3px rgba(0,0,0,0.25)',
                }}
              />

              {/* 5. Delicate White Twine Bow at intersection */}
              <div className="absolute top-[26%] left-[26%] -translate-x-[50%] -translate-y-[50%] pointer-events-none z-10">
                <svg
                  width="114"
                  height="114"
                  viewBox="0 0 78 78"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.28)]"
                >
                  {/* Center knot */}
                  <ellipse cx="39" cy="39" rx="4" ry="3.4" fill="#FFFDF8" stroke="#EFE4D3" strokeWidth="0.9" />
                  
                  {/* Left loop */}
                  <path
                    d="M37 38 C 21 27, 10 32, 19 41 C 25 47, 35 41, 37 39"
                    stroke="#FFFDF8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Left loop inner hollow line */}
                  <path
                    d="M36 38 C 23 29, 15 34, 21 41"
                    stroke="#FAF0E0"
                    strokeWidth="1.3"
                    fill="none"
                  />

                  {/* Right loop */}
                  <path
                    d="M41 38 C 56 26, 67 31, 59 40 C 53 46, 43 41, 41 39"
                    stroke="#FFFDF8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Right loop inner hollow line */}
                  <path
                    d="M42 38 C 54 28, 63 33, 57 40"
                    stroke="#FAF0E0"
                    strokeWidth="1.3"
                    fill="none"
                  />

                  {/* Left tail draping down-left */}
                  <path
                    d="M38 41 C 31 51, 20 57, 13 60"
                    stroke="#FFFDF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Right tail draping down-right */}
                  <path
                    d="M40 41 C 47 52, 57 60, 64 70"
                    stroke="#FFFDF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>

              {/* 6. Subtle bevel rim border on top and sides only */}
              <div className="absolute inset-0 rounded-t-[5px] rounded-b-none border-t border-l border-r border-b-0 border-white/18 pointer-events-none" />
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT COLUMN: Points 03 & 04 (flanking upper and lower) */}
          {/* ------------------------------------------------------- */}
          <div className="order-3 md:order-3 md:col-span-3 flex flex-col justify-between pb-8 sm:pb-16 md:pb-20 gap-16 sm:gap-24 text-center md:text-left">
            
            {/* Feature 03 (Upper) */}
            <div className="flex flex-col items-center md:items-start">
              <span className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white/90 font-light mb-1.5 tracking-wide">
                {f3.number}
              </span>
              <h3 className="font-serif text-sm sm:text-base lg:text-lg font-normal text-white mb-1.5 tracking-wide">
                {f3.title}
              </h3>
              <p className="font-sans text-[11px] sm:text-xs text-white/75 leading-relaxed max-w-[220px] font-light">
                {f3.description}
              </p>
            </div>

            {/* Feature 04 (Lower) */}
            <div className="flex flex-col items-center md:items-start">
              <span className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white/90 font-light mb-1.5 tracking-wide">
                {f4.number}
              </span>
              <h3 className="font-serif text-sm sm:text-base lg:text-lg font-normal text-white mb-1.5 tracking-wide">
                {f4.title}
              </h3>
              <p className="font-sans text-[11px] sm:text-xs text-white/75 leading-relaxed max-w-[220px] font-light">
                {f4.description}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
