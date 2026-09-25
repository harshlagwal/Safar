import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Lenis from 'lenis';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';

import { TripProvider } from './context/TripContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { NamasteBharatIntro } from './components/NamasteBharatIntro';
import { SafarAiChat } from './components/SafarAiChat';

// Code-split all non-landing routes for instant initial load
const Plan = lazy(() => import('./pages/Plan').then((m) => ({ default: m.Plan })));
const Generating = lazy(() => import('./pages/Generating').then((m) => ({ default: m.Generating })));
const Result = lazy(() => import('./pages/Result').then((m) => ({ default: m.Result })));
const Trips = lazy(() => import('./pages/Trips').then((m) => ({ default: m.Trips })));
const Share = lazy(() => import('./pages/Share').then((m) => ({ default: m.Share })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })));

// Centered lightweight Safar mark fallback (never blank)
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4" role="status" aria-label="Loading page">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 animate-ping absolute inset-0" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#ff3b30] flex items-center justify-center shadow-lg shadow-[#ff6b35]/25 relative z-10">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
      <span className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6] tracking-wide">
        Loading Safar...
      </span>
    </div>
  );
}

// Scroll to top on route transition smoothly through Lenis
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const globalLenis = (window as any).__lenis;
    if (globalLenis) {
      globalLenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

function AppContent({ showIntro, setShowIntro }: { showIntro: boolean; setShowIntro: (v: boolean) => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen text-[#1d1d1f] bg-[#fafafa] dark:bg-[#000000] dark:text-[#f5f5f7]">
      {showIntro && <NamasteBharatIntro onComplete={() => setShowIntro(false)} />}
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 apple-gpu"
        >
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/generating" element={<Generating />} />
              <Route path="/result" element={<Result />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/share/:id" element={<Share />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Fallback */}
              <Route path="*" element={<Landing />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <SafarAiChat />
      <Footer />
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = React.useState(true);

  // Initialize Lenis for buttery macOS-style smooth scroll (respecting prefers-reduced-motion & touch)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lenis: Lenis | null = null;
    let animId: number;

    try {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
        infinite: false,
        syncTouch: false,
      });

      (window as any).__lenis = lenis;

      const raf = (time: number) => {
        lenis?.raf(time);
        animId = requestAnimationFrame(raf);
      };

      animId = requestAnimationFrame(raf);
    } catch (err) {
      console.warn('Lenis smooth scroll initialization skipped:', err);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      lenis?.destroy();
      (window as any).__lenis = null;
    };
  }, []);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <ScrollToTop />
          <ToastProvider>
            <TripProvider>
              <AppContent showIntro={showIntro} setShowIntro={setShowIntro} />
            </TripProvider>
          </ToastProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

