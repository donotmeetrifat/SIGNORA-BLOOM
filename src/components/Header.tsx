import React from 'react';
import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeSection?: string;
  onOpenContact: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection = 'home',
  onOpenContact,
  onNavigateSection,
}) => {
  return (
    <header 
      id="main-site-header"
      role="banner"
      className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md backdrop-saturate-150 border-b border-[#F0EBE5]/80 shadow-[0_4px_24px_rgba(51,43,43,0.04)] transition-all"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col items-center">
        
        {/* Centered Brand Wordmark (H1 for search engines, styled consistently) */}
        <div className="mb-2 sm:mb-3">
          <h1 className="m-0 p-0 leading-none">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigateSection('home');
              }}
              className="text-center inline-block group focus:outline-none"
              aria-label="Signora Bloom — Women's Jewelry & Fashion Accessories"
            >
              <span className="font-serif text-2xl sm:text-3xl md:text-[32px] tracking-[0.22em] text-[#2A2323] font-light group-hover:text-[#B89B82] transition-colors inline-block">
                SIGNORA BLOOM
              </span>
            </a>
          </h1>
        </div>

        {/* Centered Sub-Navigation Links with Responsive Touch Targets */}
        <nav 
          role="navigation"
          aria-label="Main Navigation" 
          className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 md:gap-x-9 gap-y-1.5 text-[10px] sm:text-[11px] tracking-[0.22em] sm:tracking-[0.24em] uppercase text-[#736767]"
        >
          {/* HOME */}
          <button
            type="button"
            onClick={() => onNavigateSection('home')}
            className={`transition-colors py-2 px-1 flex items-center gap-1 cursor-pointer relative min-h-[40px] focus:outline-none ${
              activeSection === 'home'
                ? 'text-[#C97A63] font-medium'
                : 'hover:text-[#2A2323]'
            }`}
          >
            <span>HOME</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            {activeSection === 'home' && (
              <span className="absolute bottom-1 left-1 right-1 h-[1.5px] bg-[#C97A63]" />
            )}
          </button>

          {/* COLLECTIONS */}
          <button
            type="button"
            onClick={() => onNavigateSection('collections')}
            className={`transition-colors py-2 px-1 flex items-center gap-1 cursor-pointer min-h-[40px] focus:outline-none ${
              activeSection === 'collections'
                ? 'text-[#C97A63] font-medium'
                : 'hover:text-[#2A2323]'
            }`}
          >
            <span>COLLECTIONS</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            {activeSection === 'collections' && (
              <span className="absolute bottom-1 left-1 right-1 h-[1.5px] bg-[#C97A63]" />
            )}
          </button>

          {/* EVERYDAY ELEGANCE */}
          <button
            type="button"
            onClick={() => onNavigateSection('everyday-elegance')}
            className={`transition-colors py-2 px-1 flex items-center gap-1 cursor-pointer min-h-[40px] focus:outline-none ${
              activeSection === 'everyday-elegance'
                ? 'text-[#C97A63] font-medium'
                : 'hover:text-[#2A2323]'
            }`}
          >
            <span>ELEGANCE</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            {activeSection === 'everyday-elegance' && (
              <span className="absolute bottom-1 left-1 right-1 h-[1.5px] bg-[#C97A63]" />
            )}
          </button>

          {/* ABOUT */}
          <button
            type="button"
            onClick={() => onNavigateSection('about')}
            className={`transition-colors py-2 px-1 flex items-center gap-1 cursor-pointer min-h-[40px] focus:outline-none ${
              activeSection === 'about'
                ? 'text-[#C97A63] font-medium'
                : 'hover:text-[#2A2323]'
            }`}
          >
            <span>ABOUT</span>
            {activeSection === 'about' && (
              <span className="absolute bottom-1 left-1 right-1 h-[1.5px] bg-[#C97A63]" />
            )}
          </button>

          {/* CONTACT */}
          <button
            type="button"
            onClick={onOpenContact}
            className="transition-colors py-2 px-1 flex items-center gap-1 cursor-pointer font-medium hover:text-[#2A2323] min-h-[40px] focus:outline-none"
          >
            <span>CONTACT</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
