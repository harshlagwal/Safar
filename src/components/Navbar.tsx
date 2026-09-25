import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles, LogOut, Sun, Moon, KeyRound, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Logo } from './Logo';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStoredGeminiApiKey, getStoredOpenRouterApiKey } from '../services/api';
import { ApiKeyModal } from './ApiKeyModal';
import { DeleteAccountModal } from './DeleteAccountModal';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tripsCount } = useTrip();
  const { user, logout, deleteAccount } = useAuth();
  const { showToast } = useToast();

  const checkApiKeys = () => {
    setHasGeminiKey(!!getStoredGeminiApiKey());
    setHasOpenRouterKey(!!getStoredOpenRouterApiKey());
  };

  useEffect(() => {
    checkApiKeys();
  }, [apiKeyModalOpen, user, location.pathname]);

  const hasApiKey = hasGeminiKey || hasOpenRouterKey;

  const getApiKeyTitle = () => {
    if (hasGeminiKey && hasOpenRouterKey) return 'Google Gemini & OpenRouter Keys Active';
    if (hasOpenRouterKey) return 'OpenRouter API Key Active';
    if (hasGeminiKey) return 'Google Gemini API Key Active';
    return 'Configure free AI API Key';
  };

  const handleApiKeyBtnClick = () => {
    if (!user) {
      showToast('Please sign in or create an account first', 'info');
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }
    setApiKeyModalOpen(true);
  };

  useEffect(() => {
    let ticking = false;
    let lastScrolled = window.scrollY > 20;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    try {
      localStorage.setItem('safar-theme', nextDark ? 'dark' : 'light');
    } catch {
      // safe fallback
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
    try {
      localStorage.setItem('safar-lang', nextLang);
    } catch {
      // safe fallback
    }
  };

  // Close dropdown on outside click or navigation
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const firstLetter = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header
      id="main-nav"
      className={`fixed top-0 inset-x-0 z-40 h-16 transition-all duration-300 ${
        scrolled
          ? 'nav-glass border-b border-[#e8e8ed]/80 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1100px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          id="nav-logo"
          aria-label="Safar — home"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <Logo variant="full" height={28} />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#ff6b35] bg-[#ff6b35]/10 px-2 py-0.5 rounded-full ml-1">
            <Sparkles className="w-3 h-3" /> India AI
          </span>
        </Link>

        {/* Navigation Links & Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/trips"
            id="nav-link-trips"
            className={`text-[15px] font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              isActive('/trips')
                ? 'text-[#ff6b35] bg-[#ff6b35]/10'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t('nav.savedTrips')}</span>
            {tripsCount > 0 && (
              <span className="inline-flex items-center justify-center text-[11px] font-semibold w-4 h-4 rounded-full bg-[#1d1d1f] dark:bg-[#333336] text-white">
                {tripsCount}
              </span>
            )}
          </Link>

          {/* Orange Card: API Key + Plan Trip */}
          <div className="flex items-center gap-1.5 p-1 pl-1.5 pr-1.5 rounded-full bg-[#ff6b35]/10 dark:bg-[#ff6b35]/15 border border-[#ff6b35]/30 shadow-2xs">
            {/* Gemini / OpenRouter API Key Button */}
            <button
              type="button"
              id="nav-api-key-btn"
              onClick={handleApiKeyBtnClick}
              className={`text-[12.5px] font-medium px-2.5 sm:px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                hasApiKey
                  ? 'border border-emerald-200 dark:border-emerald-800/80 bg-emerald-500 text-white shadow-2xs'
                  : 'bg-white/80 dark:bg-[#1d1d1f]/80 text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-white dark:hover:bg-[#2c2c2e]'
              }`}
              title={getApiKeyTitle()}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {hasApiKey ? 'Key Active' : 'API Key'}
              </span>
              {hasApiKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Plan Trip Button */}
            <Link
              to="/plan"
              id="nav-link-plan"
              className="text-[13px] font-semibold px-3.5 py-1 rounded-full bg-[#ff6b35] hover:bg-[#ff5722] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('nav.planTrip')}</span>
              <Sparkles className="w-3 h-3 text-white/90" />
            </Link>
          </div>

          {/* Hindi / English Language Toggle "अ / A" */}
          <button
            type="button"
            id="lang-toggle-btn"
            onClick={toggleLanguage}
            className="h-9 px-2.5 rounded-full flex items-center justify-center gap-1 border border-[#e8e8ed] dark:border-[#333336] bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f2f2f5] dark:hover:bg-[#2c2c2e] transition-all duration-200 shadow-2xs cursor-pointer text-[13px] font-semibold select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
            title={i18n.language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            aria-label="Toggle language English / Hindi"
          >
            <span className={i18n.language === 'hi' ? 'text-[#ff6b35] font-bold' : 'text-[#86868b] dark:text-[#a1a1a6]'}>
              अ
            </span>
            <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">/</span>
            <span className={i18n.language === 'en' ? 'text-[#ff6b35] font-bold' : 'text-[#86868b] dark:text-[#a1a1a6]'}>
              A
            </span>
          </button>

          {/* Theme Toggle Button: circular 36px, Moon (light) / Sun (dark), 0.3s rotate+fade */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#e8e8ed] dark:border-[#333336] bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f2f2f5] dark:hover:bg-[#2c2c2e] transition-all duration-300 shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle color theme"
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Sun
                className={`w-4 h-4 text-[#f5f5f7] absolute transition-all duration-300 ${
                  isDark
                    ? 'rotate-0 opacity-100 scale-100'
                    : '-rotate-90 opacity-0 scale-50'
                }`}
              />
              <Moon
                className={`w-4 h-4 text-[#1d1d1f] absolute transition-all duration-300 ${
                  isDark
                    ? 'rotate-90 opacity-0 scale-50'
                    : 'rotate-0 opacity-100 scale-100'
                }`}
              />
            </div>
          </button>

          {/* Auth State */}
          {user ? (
            /* Logged in: small avatar circle with user's first letter + clean Apple dropdown */
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                type="button"
                id="nav-user-avatar"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-[#ff6b35] text-white font-semibold text-[14px] flex items-center justify-center shadow-xs hover:ring-2 hover:ring-[#ff6b35]/30 transition-all cursor-pointer select-none"
                aria-label="User profile menu"
                aria-expanded={dropdownOpen}
              >
                {firstLetter}
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] shadow-lg dark:shadow-none p-2 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 border-b border-[#e8e8ed] dark:border-[#333336]">
                    <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {user.name}
                    </p>
                    <p className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/trips"
                      className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl hover:bg-[#f2f2f5] dark:hover:bg-[#2c2c2e] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#ff6b35]" />
                      <span>My Saved Trips</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setApiKeyModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl hover:bg-[#f2f2f5] dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-[#ff6b35]" />
                        <span>AI API Keys</span>
                      </div>
                      {hasApiKey && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#e8e8ed] dark:border-[#333336]">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] rounded-xl hover:bg-[#f2f2f5] dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logOut')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setDeleteAccountModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('nav.deleteAccount')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged out: "Login" text link + "Sign Up" pill button */
            <div className="flex items-center gap-2 sm:gap-3 ml-1">
              <Link
                to="/login"
                id="nav-link-login"
                className="text-[14px] sm:text-[15px] font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                {t('nav.signIn')}
              </Link>
              <Link to="/signup" id="nav-btn-signup">
                <Button size="sm" variant="primary" className="shadow-xs cursor-pointer">
                  <span>{t('nav.signUp')}</span>
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Bring-Your-Own Gemini / OpenRouter API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => {
          setApiKeyModalOpen(false);
          checkApiKeys();
        }}
        onSuccess={(provider) => {
          checkApiKeys();
          if (provider === 'openrouter') {
            showToast('OpenRouter API Key saved ✓', 'success');
          } else {
            showToast('Google Gemini API Key saved ✓', 'success');
          }
        }}
      />

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
        onConfirm={async () => {
          await deleteAccount();
          showToast('Account and associated trips deleted permanently', 'info');
        }}
      />
    </header>
  );
};
