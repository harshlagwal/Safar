import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowUp, Plus, AlertCircle, KeyRound } from 'lucide-react';
import { Logo } from './Logo';
import { postChat, ChatMessage, TripContext } from '../services/chat';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStoredGeminiApiKey, getStoredOpenRouterApiKey } from '../services/api';
import { ApiKeyModal } from './ApiKeyModal';

const STORAGE_KEY = 'safar-chat';

const QUICK_CHIPS = [
  '₹5,000 me kaha jaaun?',
  'Manali ka best time?',
  'Train booking tips',
  'Kashmir safe hai?',
];

/**
 * Safely parse markdown-lite text (bold **text** and bulleted lists)
 * into pure React virtual DOM elements with zero HTML injection (no dangerouslySetInnerHTML).
 */
function renderMarkdownLite(text: string): React.ReactNode {
  // Split into lines
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1.5 pl-4 list-disc space-y-1 text-inherit">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInlineBold(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatInlineBold = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-inherit">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [str];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Check if line is a bullet item (* or -)
    if (/^[\*\-]\s+/.test(line)) {
      const bulletContent = line.replace(/^[\*\-]\s+/, '');
      currentList.push(bulletContent);
    } else {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed my-1">
          {formatInlineBold(line)}
        </p>
      );
    }
  }

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

export function SafarAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false);

  const checkApiKeys = () => {
    setHasGeminiKey(!!getStoredGeminiApiKey());
    setHasOpenRouterKey(!!getStoredOpenRouterApiKey());
  };

  useEffect(() => {
    checkApiKeys();
  }, [user, apiKeyModalOpen, isOpen]);

  const hasApiKey = hasGeminiKey || hasOpenRouterKey;

  const location = useLocation();
  const { currentPlan, lastRequest } = useTrip();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Restore messages from localStorage on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Sync messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // Storage might be full or private browsing
      }
    }
  }, [messages]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 110)}px`;
    }
  }, [input]);

  // Detect trip context if on result page or plan exists
  const origin = lastRequest?.origin || currentPlan?.request?.origin || currentPlan?.route?.[0]?.from;
  const destination = lastRequest?.destination || currentPlan?.request?.destination || (currentPlan?.route && currentPlan.route.length > 0 ? currentPlan.route[currentPlan.route.length - 1].to : undefined);
  const days = lastRequest?.days || currentPlan?.request?.days || currentPlan?.dayPlan?.length;
  const budget = lastRequest?.budget || currentPlan?.request?.budget || currentPlan?.totalCost?.max;

  const isResultPage = location.pathname === '/result';
  const hasTripPlan = Boolean(destination);
  const showTripContext = isResultPage && hasTripPlan;

  const currentTripContext: TripContext | undefined = hasTripPlan
    ? {
        origin,
        destination,
        days,
        budget,
      }
    : undefined;

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customText) setInput('');

    setIsLoading(true);

    try {
      // Map to service format
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await postChat(
        payloadMessages,
        showTripContext ? currentTripContext : undefined
      );

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err?.message || 'Kuch takneeki dikkat aayi. Dobara try karein.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setInput('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {/* Floating Pill Entry Button with Google Gemini Rotating Border Beam */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Safar AI Chat Assistant"
        className={`fixed bottom-6 right-6 z-40 p-[2px] rounded-full overflow-hidden shadow-xl shadow-[#ea580c]/35 hover:shadow-2xl hover:shadow-[#ea580c]/55 cursor-pointer select-none transition-all duration-300 group border border-black/10 dark:border-white/15 bg-[#ea580c] ${
          isOpen ? 'pointer-events-none opacity-0 scale-90' : 'opacity-100'
        }`}
      >
        {/* Rotating Gemini Conic Beam */}
        <span
          aria-hidden="true"
          className="absolute inset-[-150%] m-auto aspect-square gemini-border-spin pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0 250deg, rgba(255,255,255,0.1) 280deg, rgba(165,243,252,0.85) 325deg, #ffffff 360deg)',
          }}
        />

        {/* Inner Content Layer (Sits crisp inside the rotating beam) */}
        <div className="relative z-10 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#ff6b35] via-[#ff5824] to-[#ea580c] text-white font-medium text-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1c1c1f] flex items-center justify-center shadow-xs">
              <Logo variant="icon" height={14} />
            </div>
          </div>
          <span className="font-bold tracking-wide">Safar AI</span>
        </div>
      </motion.button>

      {/* Chat Panel Modal / Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 top-14 md:top-auto md:bottom-6 md:right-6 md:left-auto md:w-[410px] md:h-[600px] md:max-h-[calc(100vh-48px)] rounded-t-3xl md:rounded-3xl bg-[#fafafa]/95 dark:bg-[#121214]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden font-sans"
              role="dialog"
              aria-label="Safar AI Travel Assistant"
            >
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-black/8 dark:border-white/8 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c1c1f] border border-black/8 dark:border-white/10 flex items-center justify-center shadow-xs shrink-0">
                    <Logo variant="icon" height={19} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        Safar AI
                      </h2>
                      <span className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-[#ff6b35] dark:text-[#ff8252] border border-[#ff6b35]/20">
                        Expert
                      </span>
                    </div>
                    <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                      {showTripContext
                        ? `Trip: ${origin || 'Origin'} → ${destination}`
                        : 'Your Indian Travel Assistant'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {hasGeminiKey && hasOpenRouterKey ? (
                    <span
                      className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-1"
                      title="Dual Engine: Gemini 2.5 Flash + OpenRouter Fallback"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini + OpenRouter Live
                    </span>
                  ) : hasOpenRouterKey ? (
                    <span
                      className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mr-1"
                      title="OpenRouter Engine Active"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      OpenRouter Live
                    </span>
                  ) : hasGeminiKey ? (
                    <span
                      className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-1"
                      title="Google Gemini 2.5 Flash Active"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini Live
                    </span>
                  ) : null}

                  {showTripContext && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      About this trip
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleNewChat}
                    title="New chat"
                    className="p-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Start new chat"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    className="p-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Guest / Connect API Banner */}
              {!user ? (
                <div className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 via-[#ff6b35]/10 to-amber-500/10 border-b border-[#ff6b35]/15 flex items-center justify-between gap-2 text-xs shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff6b35] shrink-0" />
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] text-[11px] truncate">
                      Guest: Sign up karke Gemini ya OpenRouter API connect karein
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/signup');
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f04818] text-white font-medium text-[11px] shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              ) : !hasApiKey ? (
                <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-2 text-xs shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] text-[11px] truncate">
                      Gemini ya OpenRouter API Key connect karein for faster replies
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApiKeyModalOpen(true)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-[#ff6b35] text-white font-medium text-[11px] shadow-xs hover:bg-[#e85520] transition-colors cursor-pointer"
                  >
                    Connect API
                  </button>
                </div>
              ) : null}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[14px]">
                {/* Empty State */}
                {messages.length === 0 && (
                  <div className="h-full flex flex-col justify-center items-center text-center px-2 py-4">
                    <div className="w-13 h-13 rounded-2xl bg-white dark:bg-[#1c1c1f] border border-black/8 dark:border-white/10 shadow-xs flex items-center justify-center mb-3">
                      <Logo variant="icon" height={30} />
                    </div>
                    <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                      Namaste! Main Safar AI hoon.
                    </h3>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-[280px] mb-5 leading-relaxed">
                      Bharat ke kisi bhi kone ki yatra, budget, packing ya routes ke bare mein poochhein.
                    </p>

                    {/* Quick Suggestion Chips */}
                    <div className="w-full space-y-2">
                      <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider text-left pl-1">
                        Sujhav
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {QUICK_CHIPS.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(chip)}
                            className="w-full text-left text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/6 dark:border-white/6 text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#ff6b35]/50 hover:bg-[#ff6b35]/5 dark:hover:bg-[#ff6b35]/10 transition-all cursor-pointer shadow-xs"
                          >
                            ✨ {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages List */}
                {messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1c1c1f] border border-black/8 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs mb-0.5">
                        <Logo variant="icon" height={13} />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 shadow-xs ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#ff6b35] to-[#f04818] text-white rounded-2xl rounded-br-xs font-normal selection:bg-white selection:text-[#ff6b35]'
                          : 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/6 dark:border-white/6 rounded-2xl rounded-bl-xs'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      ) : (
                        renderMarkdownLite(m.content)
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1c1c1f] border border-black/8 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs mb-0.5">
                      <Logo variant="icon" height={13} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-white dark:bg-[#1d1d1f] border border-black/6 dark:border-white/6 shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Inline Error Chip */}
                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      className="font-medium underline hover:no-underline shrink-0 text-red-800 dark:text-red-200"
                    >
                      Dobara try karein
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t border-black/8 dark:border-white/8 bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-end gap-2 bg-black/4 dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-[#ff6b35]/60 focus-within:ring-2 focus-within:ring-[#ff6b35]/15 transition-all"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Safar ke baare me kuch poochhein..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent border-0 resize-none py-1.5 text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-hidden max-h-28"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      input.trim() && !isLoading
                        ? 'bg-gradient-to-br from-[#ff6b35] to-[#f04818] text-white shadow-md shadow-[#ff6b35]/30 cursor-pointer active:scale-95'
                        : 'bg-black/10 dark:bg-white/10 text-[#86868b] cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#86868b] dark:text-[#6e6e73] px-1 font-medium">
                  <span>Enter to send · Shift+Enter for newline</span>
                  <span className="flex items-center gap-1">
                    {hasGeminiKey && hasOpenRouterKey ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Gemini + OpenRouter Live</span>
                    ) : hasOpenRouterKey ? (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">OpenRouter Live</span>
                    ) : hasGeminiKey ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Gemini Live</span>
                    ) : (
                      <span>Safar AI v1.6</span>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </>
  );
}
