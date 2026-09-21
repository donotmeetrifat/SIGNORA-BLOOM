import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollections } from './components/FeaturedCollections';
import { EverydayElegance } from './components/EverydayElegance';
import { EditorialStoryTabs } from './components/EditorialStoryTabs';
import { GiftPackagingSection } from './components/GiftPackagingSection';
import { Footer } from './components/Footer';
import { FadeInSection } from './components/FadeInSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ContactConciergeModal } from './components/ContactConciergeModal';
import { Accessory } from './types';
import { SiteContentProvider } from './context/SiteContentContext';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SeoHead } from './components/SeoHead';

export default function App() {
  const getRouteFromUrl = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (
      path === '/rifat' ||
      path.startsWith('/rifat/') ||
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#rifat' ||
      hash.startsWith('#/rifat') ||
      hash === '#admin' ||
      hash.startsWith('#/admin')
    ) {
      return '/rifat';
    }
    return path;
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getRouteFromUrl();
  });

  const [selectedPiece, setSelectedPiece] = useState<Accessory | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [inquiryAccessory, setInquiryAccessory] = useState<Accessory | null>(null);
  const [activeNavSection, setActiveNavSection] = useState<string>('home');

  // Handle popstate and hashchange for browser back/forward buttons & direct links
  useEffect(() => {
    const handleLocationChange = () => {
      const newPath = getRouteFromUrl();
      setCurrentPath(newPath);

      // Handle section routes from path or hash
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash && ['collections', 'everyday-elegance', 'about', 'surprise-loved-one', 'home'].includes(hash)) {
        setActiveNavSection(hash);
        const elem = document.getElementById(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenContact = (accessory?: Accessory | null) => {
    setInquiryAccessory(accessory || null);
    setIsContactOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    if (currentPath !== '/' && currentPath !== '') {
      navigateTo('/');
      // Allow DOM to settle before scrolling
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    setActiveNavSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreCollections = () => {
    handleNavigateSection('collections');
  };

  const isAdminRoute =
    currentPath === '/rifat' ||
    currentPath.startsWith('/rifat/') ||
    currentPath === '/admin' ||
    currentPath.startsWith('/admin/');

  // Determine if current path is a valid recognized route
  const knownPublicPaths = [
    '/',
    '',
    '/collections',
    '/everyday-elegance',
    '/about',
    '/surprise-loved-one',
    '/contact',
  ];
  const isNotFound = !isAdminRoute && !knownPublicPaths.includes(currentPath);

  return (
    <SiteContentProvider>
      {/* Dynamic SEO Meta Tags, Canonical Link & Schema.org JSON-LD */}
      <SeoHead
        currentPath={currentPath}
        activeNavSection={activeNavSection}
        selectedPiece={selectedPiece}
        isNotFound={isNotFound}
      />

      {isAdminRoute ? (
        <AdminPage onNavigateHome={() => navigateTo('/')} />
      ) : isNotFound ? (
        <NotFoundPage
          onNavigateHome={() => navigateTo('/')}
          onNavigateSection={handleNavigateSection}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#2A2323] selection:bg-[#D8A7A7]/30 selection:text-[#332B2B]">
          {/* 1. HEADER (Glassy navbar effect) */}
          <Header
            activeSection={activeNavSection}
            onOpenContact={() => handleOpenContact()}
            onNavigateSection={handleNavigateSection}
          />

          {/* MAIN HOMEPAGE SECTIONS */}
          <main role="main" className="flex-1">
            {/* 2. HERO: Interactive Slider with 16:9 scenes and controls */}
            <FadeInSection delay={80}>
              <Hero onExploreClick={handleExploreCollections} />
            </FadeInSection>

            {/* 3. CATEGORY MOSAIC: 3-column mosaic with aligned 9:16 and 1:1 ratios */}
            <FadeInSection>
              <FeaturedCollections
                onSelectCategory={() => handleNavigateSection('everyday-elegance')}
              />
            </FadeInSection>

            {/* 4. EVERYDAY ELEGANCE: 4-square product row */}
            <FadeInSection>
              <EverydayElegance
                onSelectPiece={(piece) => setSelectedPiece(piece)}
              />
            </FadeInSection>

            {/* 5. TABBED EDITORIAL: Beauty & Ingenuity (3:4 main image & 1:1 detail) */}
            <FadeInSection>
              <EditorialStoryTabs onExplore={handleExploreCollections} />
            </FadeInSection>

            {/* 6. SURPRISE A LOVED ONE: Luxury Striped Gift Box Section */}
            <FadeInSection>
              <GiftPackagingSection onOpenGiftInquiry={() => handleOpenContact()} />
            </FadeInSection>
          </main>

          {/* 7. CLEAN FOOTER */}
          <FadeInSection>
            <Footer
              onOpenContact={() => handleOpenContact()}
              onNavigateSection={handleNavigateSection}
              onNavigateAdmin={() => navigateTo('/rifat')}
            />
          </FadeInSection>

          {/* Editorial Piece Detail Modal */}
          <ProductDetailModal
            accessory={selectedPiece}
            onClose={() => setSelectedPiece(null)}
            onInquire={(piece) => {
              setSelectedPiece(null);
              handleOpenContact(piece);
            }}
          />

          {/* Contact & Atelier Consultation Modal */}
          <ContactConciergeModal
            isOpen={isContactOpen}
            onClose={() => {
              setIsContactOpen(false);
              setInquiryAccessory(null);
            }}
            preselectedAccessory={inquiryAccessory}
          />
        </div>
      )}
    </SiteContentProvider>
  );
}
