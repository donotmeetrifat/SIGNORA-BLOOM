import React from 'react';
import { Lock } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface FooterProps {
  onOpenContact: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigateAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onNavigateSection, onNavigateAdmin }) => {
  const { content } = useSiteContent();

  const facebookUrl = content?.brand?.facebookUrl || 'https://www.facebook.com/signorabloom/';
  const instagramUrl = content?.brand?.instagramUrl || 'https://instagram.com/tuhinajahantopa';

  const normalizedFacebookUrl = facebookUrl.startsWith('http') ? facebookUrl : `https://${facebookUrl}`;
  const normalizedInstagramUrl = instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`;

  return (
    <footer 
      id="footer-section" 
      role="contentinfo"
      className="bg-[#FFFFFF] text-[#332B2B] border-t border-[#F0EBE5] py-12 sm:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Brand Name */}
        <div className="font-serif text-2xl sm:text-3xl tracking-[0.24em] font-light text-[#332B2B] mb-2">
          {content?.brand?.name || 'SIGNORA BLOOM'}
        </div>

        {/* Tagline */}
        <p className="font-serif text-xs sm:text-sm italic text-[#8E8080] mb-6 sm:mb-7">
          {content?.brand?.tagline || 'A Curated Collection of Everyday Elegance.'}
        </p>

        {/* Navigation */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 md:gap-x-9 gap-y-1 text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#736767] mb-6 sm:mb-7">
          <button 
            type="button"
            onClick={() => onNavigateSection('home')} 
            aria-label="Navigate to Home section"
            className="hover:text-[#332B2B] transition-colors cursor-pointer py-1.5 px-1 min-h-[38px] flex items-center"
          >
            HOME
          </button>
          <button 
            type="button"
            onClick={() => onNavigateSection('collections')} 
            aria-label="Explore curated women's accessories collections"
            className="hover:text-[#332B2B] transition-colors cursor-pointer py-1.5 px-1 min-h-[38px] flex items-center"
          >
            COLLECTIONS
          </button>
          <button 
            type="button"
            onClick={() => onNavigateSection('everyday-elegance')} 
            aria-label="Discover Everyday Elegance showcase"
            className="hover:text-[#332B2B] transition-colors cursor-pointer py-1.5 px-1 min-h-[38px] flex items-center"
          >
            ELEGANCE
          </button>
          <button 
            type="button"
            onClick={() => onNavigateSection('about')} 
            aria-label="About Signora Bloom brand and craftsmanship"
            className="hover:text-[#332B2B] transition-colors cursor-pointer py-1.5 px-1 min-h-[38px] flex items-center"
          >
            ABOUT
          </button>
          <button 
            type="button"
            onClick={onOpenContact} 
            aria-label="Contact Signora Bloom Concierge"
            className="hover:text-[#332B2B] transition-colors cursor-pointer py-1.5 px-1 min-h-[38px] flex items-center font-medium"
          >
            CONTACT
          </button>
        </nav>

        {/* Social */}
        <div className="flex items-center justify-center space-x-6 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#736767] mb-7 sm:mb-8">
          <a
            id="footer-instagram-link"
            href={normalizedInstagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Signora Bloom on Instagram"
            className="hover:text-[#332B2B] transition-colors py-1.5 px-2 min-h-[38px] flex items-center"
          >
            Instagram
          </a>
          <span className="text-[#D8C8B8]">·</span>
          <a
            id="footer-facebook-link"
            href={normalizedFacebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Signora Bloom on Facebook"
            className="hover:text-[#332B2B] transition-colors py-1.5 px-2 min-h-[38px] flex items-center"
          >
            Facebook
          </a>
        </div>

        {/* Divider */}
        <div className="w-10 h-[1px] bg-[#E8DFD5] mx-auto mb-6" />

        {/* Copyright & Admin Portal Link */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] tracking-[0.16em] text-[#8E8080]">
          <span>© 2026 SIGNORA BLOOM. All rights reserved.</span>
          {onNavigateAdmin && (
            <>
              <span className="text-[#D8C8B8] hidden sm:inline">·</span>
              <button
                type="button"
                onClick={onNavigateAdmin}
                className="inline-flex items-center gap-1 text-[#A09393] hover:text-[#2A2323] transition-colors cursor-pointer py-1 min-h-[32px]"
                title="Admin Panel (/rifat)"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Atelier Admin</span>
              </button>
            </>
          )}
        </div>

      </div>
    </footer>
  );
};
