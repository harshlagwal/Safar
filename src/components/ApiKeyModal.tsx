import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Trash2,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { Button } from './Button';
import {
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  removeStoredGeminiApiKey,
  getStoredOpenRouterApiKey,
  setStoredOpenRouterApiKey,
  removeStoredOpenRouterApiKey,
} from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (provider: ProviderTab) => void;
  title?: string;
  description?: string;
}

type ProviderTab = 'gemini' | 'openrouter';

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'AI Provider Settings',
  description = 'Connect your own API key to plan itineraries and chat without server rate limits. Keys are stored 100% locally in your browser.',
}) => {
  const [activeTab, setActiveTab] = useState<ProviderTab>('gemini');
  
  // Gemini state
  const [geminiKey, setGeminiKey] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  
  // OpenRouter state
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false);

  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existingGemini = getStoredGeminiApiKey();
      if (existingGemini) {
        setGeminiKey(existingGemini);
        setHasGeminiKey(true);
      } else {
        setGeminiKey('');
        setHasGeminiKey(false);
      }

      const existingOpenRouter = getStoredOpenRouterApiKey();
      if (existingOpenRouter) {
        setOpenRouterKey(existingOpenRouter);
        setHasOpenRouterKey(true);
      } else {
        setOpenRouterKey('');
        setHasOpenRouterKey(false);
      }

      // If OpenRouter key is present and Gemini is empty, auto-select OpenRouter tab
      if (!existingGemini && existingOpenRouter) {
        setActiveTab('openrouter');
      } else {
        setActiveTab('gemini');
      }

      setError(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleGeminiChange = (val: string) => {
    setGeminiKey(val);
    setError(null);
    // Smart auto-detect: if user pastes an OpenRouter key into Gemini tab
    if (val.trim().startsWith('sk-or-')) {
      setOpenRouterKey(val.trim());
      setGeminiKey('');
      setActiveTab('openrouter');
    }
  };

  const handleOpenRouterChange = (val: string) => {
    setOpenRouterKey(val);
    setError(null);
    // Smart auto-detect: if user pastes a Gemini key into OpenRouter tab
    if (val.trim().startsWith('AIza')) {
      setGeminiKey(val.trim());
      setOpenRouterKey('');
      setActiveTab('gemini');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentProvider = activeTab;

    if (currentProvider === 'gemini') {
      const cleanKey = geminiKey.trim();
      if (!cleanKey) {
        setError('Please enter a valid Google Gemini API key');
        return;
      }
      if (!cleanKey.startsWith('AIza') && cleanKey.length < 20) {
        setError('Key format seems unusual (typically starts with "AIza")');
        return;
      }
      setStoredGeminiApiKey(cleanKey);
      setHasGeminiKey(true);
    } else {
      const cleanKey = openRouterKey.trim();
      if (!cleanKey) {
        setError('Please enter a valid OpenRouter API key');
        return;
      }
      if (!cleanKey.startsWith('sk-or-') && cleanKey.length < 20) {
        setError('OpenRouter keys typically start with "sk-or-v1-"');
        return;
      }
      setStoredOpenRouterApiKey(cleanKey);
      setHasOpenRouterKey(true);
    }

    setSavedSuccess(true);
    setError(null);

    setTimeout(() => {
      onSuccess?.(currentProvider);
      onClose();
    }, 700);
  };

  const handleRemoveActive = () => {
    if (activeTab === 'gemini') {
      removeStoredGeminiApiKey();
      setGeminiKey('');
      setHasGeminiKey(false);
    } else {
      removeStoredOpenRouterApiKey();
      setOpenRouterKey('');
      setHasOpenRouterKey(false);
    }
    setSavedSuccess(false);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-[520px] bg-white dark:bg-[#18181b] rounded-3xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#27272a] shadow-[0_20px_60px_rgb(0,0,0,0.22)] z-10 space-y-6"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f1f5f9] dark:bg-[#27272a] text-[#64748b] hover:text-[#0c0c0e] dark:hover:text-[#f8fafc] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white flex items-center justify-center shadow-md shadow-[#ea580c]/25 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#0c0c0e] dark:text-[#f8fafc] tracking-tight">
                  {title}
                </h3>
                <p className="text-[13px] text-[#475569] dark:text-[#cbd5e1] mt-0.5 leading-relaxed font-medium">
                  {description}
                </p>
              </div>
            </div>

            {/* Segmented Provider Tabs */}
            <div className="p-1 rounded-2xl bg-[#f1f5f9] dark:bg-[#0c0c0e] border border-[#e2e8f0] dark:border-[#27272a] grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('gemini');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                  activeTab === 'gemini'
                    ? 'bg-white dark:bg-[#27272a] text-[#0c0c0e] dark:text-[#f8fafc] shadow-xs'
                    : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#0c0c0e] dark:hover:text-[#f8fafc]'
                }`}
              >
                <Cpu className="w-4 h-4 text-[#ea580c]" />
                <span>Google Gemini</span>
                {hasGeminiKey && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Configured" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('openrouter');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                  activeTab === 'openrouter'
                    ? 'bg-white dark:bg-[#27272a] text-[#0c0c0e] dark:text-[#f8fafc] shadow-xs'
                    : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#0c0c0e] dark:hover:text-[#f8fafc]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#3b82f6]" />
                <span>OpenRouter</span>
                {hasOpenRouterKey && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Configured" />
                )}
              </button>
            </div>

            {/* Step 1: Info & Get Key Link */}
            {activeTab === 'gemini' ? (
              <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#0c0c0e] border border-[#e2e8f0] dark:border-[#27272a] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#0c0c0e] dark:text-[#f8fafc]">
                      Google AI Studio (Recommended)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase">
                      Free Tier
                    </span>
                  </div>
                  <p className="text-[12px] text-[#475569] dark:text-[#cbd5e1] font-medium">
                    Takes 30 seconds to generate. No credit card required.
                  </p>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-[12px] font-bold text-[#ea580c] hover:text-[#c2410c] bg-[#ea580c]/10 hover:bg-[#ea580c]/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Get Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#0c0c0e] border border-[#e2e8f0] dark:border-[#27272a] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#0c0c0e] dark:text-[#f8fafc]">
                      OpenRouter Gateway
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full uppercase">
                      Universal Fallback
                    </span>
                  </div>
                  <p className="text-[12px] text-[#475569] dark:text-[#cbd5e1] font-medium">
                    Access Gemini, Llama 3.3, and DeepSeek with one key.
                  </p>
                </div>

                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-[12px] font-bold text-[#3b82f6] hover:text-[#2563eb] bg-[#3b82f6]/10 hover:bg-[#3b82f6]/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Get Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Step 2: Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label
                  htmlFor="ai-key-input"
                  className="block text-[12.5px] font-bold text-[#0c0c0e] dark:text-[#f8fafc] mb-1.5"
                >
                  {activeTab === 'gemini'
                    ? 'Paste Google Gemini API Key'
                    : 'Paste OpenRouter API Key'}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#64748b] dark:text-[#94a3b8] pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="ai-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder={activeTab === 'gemini' ? 'AIzaSy...' : 'sk-or-v1-...'}
                    value={activeTab === 'gemini' ? geminiKey : openRouterKey}
                    onChange={(e) =>
                      activeTab === 'gemini'
                        ? handleGeminiChange(e.target.value)
                        : handleOpenRouterChange(e.target.value)
                    }
                    className="w-full bg-[#f8fafc] dark:bg-[#0c0c0e] text-[#0c0c0e] dark:text-[#f8fafc] placeholder:text-[#94a3b8] text-[13.5px] font-mono rounded-xl border border-[#e2e8f0] dark:border-[#27272a] pl-9.5 pr-10 py-2.5 focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-[#64748b] hover:text-[#0c0c0e] dark:hover:text-[#f8fafc] transition-colors cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-[12px] text-red-500 mt-1.5 font-bold">
                    {error}
                  </p>
                )}

                {savedSuccess && (
                  <p className="text-[12px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {activeTab === 'gemini' ? 'Gemini' : 'OpenRouter'} key saved successfully in browser!
                    </span>
                  </p>
                )}
              </div>

              {/* Status summary pill */}
              <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-[#475569] dark:text-[#cbd5e1] pt-0.5">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    hasGeminiKey
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  Gemini: {hasGeminiKey ? 'Active ✓' : 'Not set'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    hasOpenRouterKey
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  OpenRouter: {hasOpenRouterKey ? 'Active ✓' : 'Not set'}
                </span>
              </div>

              {/* Privacy badge */}
              <div className="flex items-center gap-2 text-[11.5px] text-[#475569] dark:text-[#cbd5e1] font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Client-Side. Saved in browser storage only. Never stored on server database.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#e2e8f0] dark:border-[#27272a]">
                {(activeTab === 'gemini' ? hasGeminiKey : hasOpenRouterKey) ? (
                  <button
                    type="button"
                    onClick={handleRemoveActive}
                    className="inline-flex items-center gap-1 text-[13px] text-red-500 hover:text-red-600 dark:text-red-400 font-bold px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear {activeTab === 'gemini' ? 'Gemini' : 'OpenRouter'}</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onClose}
                    className="cursor-pointer font-bold"
                  >
                    <span>Close</span>
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="shadow-sm shadow-[#ea580c]/20 cursor-pointer font-bold"
                  >
                    <span>Save {activeTab === 'gemini' ? 'Gemini' : 'OpenRouter'} Key</span>
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
