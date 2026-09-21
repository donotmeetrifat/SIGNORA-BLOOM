import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onNavigateSection,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F2EC] text-[#2A2323] selection:bg-[#D8A7A7]/30 selection:text-[#332B2B]">
      {/* Header Bar */}
      <header className="w-full py-6 px-4 sm:px-8 border-b border-[#EADFD5]/70 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-left group focus:outline-none cursor-pointer"
            aria-label="Return to Signora Bloom home"
          >
            <span className="font-serif text-xl sm:text-2xl tracking-[0.22em] text-[#2A2323] font-light group-hover:text-[#B89B82] transition-colors inline-block">
              SIGNORA BLOOM
            </span>
          </button>
          
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#6E6060] hover:text-[#2A2323] transition-colors flex items-center gap-1.5 cursor-pointer py-1.5 px-3 border border-[#E0D5C8] rounded-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-xl mx-auto text-center">
          
          {/* Subtle 404 Watermark */}
          <span className="block font-serif text-7xl sm:text-8xl md:text-9xl text-[#D8C7B8]/60 font-light select-none tracking-widest mb-2">
            404
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#2A2323] font-normal tracking-wide mb-4">
            Page Not Found
          </h1>

          <p className="font-sans text-xs sm:text-sm text-[#736565] leading-relaxed max-w-md mx-auto mb-8 font-light">
            The page you are looking for may have been moved, renamed, or is currently unavailable. We invite you to explore our curated collection of everyday elegance.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#2A2323] hover:bg-[#433737] text-white text-[11px] tracking-[0.24em] uppercase transition-all duration-300 font-medium rounded-xs shadow-xs cursor-pointer active:scale-98"
            >
              Return to Homepage
            </button>
            
            {onNavigateSection && (
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => onNavigateSection('collections'), 100);
                }}
                className="w-full sm:w-auto px-6 py-3.5 border border-[#D5C6B8] hover:border-[#2A2323] text-[#2A2323] text-[11px] tracking-[0.22em] uppercase transition-all duration-300 font-medium rounded-xs cursor-pointer bg-white/50"
              >
                Explore Collections
              </button>
            )}
          </div>

          {/* Curated Navigation Suggestions */}
          <div className="pt-8 border-t border-[#E8DCD0] max-w-md mx-auto">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8E8080] mb-3 flex items-center justify-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5" />
              <span>Curated Departments</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.18em] uppercase text-[#6E6060]">
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => onNavigateSection?.('collections'), 100);
                }}
                className="hover:text-[#2A2323] hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                Rings
              </button>
              <span className="text-[#C8B8A8]">•</span>
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => onNavigateSection?.('collections'), 100);
                }}
                className="hover:text-[#2A2323] hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                Bangles & Bracelets
              </button>
              <span className="text-[#C8B8A8]">•</span>
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => onNavigateSection?.('collections'), 100);
                }}
                className="hover:text-[#2A2323] hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                Earrings
              </button>
              <span className="text-[#C8B8A8]">•</span>
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => onNavigateSection?.('about'), 100);
                }}
                className="hover:text-[#2A2323] hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                About The Brand
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#EADFD5]/70 text-center text-[10px] tracking-[0.2em] text-[#918383] uppercase">
        © 2026 SIGNORA BLOOM. A Curated Collection of Everyday Elegance.
      </footer>
    </div>
  );
};
