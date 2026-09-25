import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white dark:bg-[#1d1d1f] rounded-3xl border border-[#e8e8ed] dark:border-[#333336] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ed] dark:border-[#333336] bg-[#fafafa]/80 dark:bg-[#161618]/80 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                    Terms & Conditions
                  </h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    Safar AI Travel Planner • Last updated September 2026
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close terms modal"
                className="w-8 h-8 rounded-full text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f2f2f5] dark:hover:bg-[#2c2c2e] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-[13.5px] text-[#3a3a3c] dark:text-[#d1d1d6] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#f5f5f7] dark:bg-[#262628] border border-[#e8e8ed] dark:border-[#333336] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[12.5px] leading-snug">
                  By creating a Safar account, you agree to these Terms. We are committed to transparency, data safety, and providing high-quality travel itineraries.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  1. Service Overview & AI Estimates
                </h4>
                <p>
                  Safar generates tailored Indian travel itineraries using artificial intelligence. Route distances, travel durations, and INR budget ranges are carefully calculated estimates based on current Indian transport corridors, trains, and hospitality prices. Live ticket rates, toll variations, and seasonal spikes remain subject to official service providers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  2. User Account & Data Privacy
                </h4>
                <p>
                  Your account information (name, email, saved trip plans) is securely stored and never sold to third-party advertisers. You can delete your saved trips and account at any time from your dashboard or profile settings.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  3. Travel Safety & Personal Responsibility
                </h4>
                <p>
                  Travelers are responsible for adhering to local laws, carrying valid government identification, checking seasonal weather advisories, and verifying train/flight booking confirmations directly with respective operators.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  4. Intellectual Property & Sharing
                </h4>
                <p>
                  Itineraries created on Safar are for your personal travel use. You are free to share, export to PDF, and distribute your plans with friends and fellow travelers.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 py-4 border-t border-[#e8e8ed] dark:border-[#333336] bg-[#fafafa]/80 dark:bg-[#161618]/80 backdrop-blur-md flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
                className="text-[13px] cursor-pointer"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onAccept}
                className="text-[13px] flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept & Continue</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
