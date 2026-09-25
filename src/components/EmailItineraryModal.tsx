import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { sendTripEmailApi } from '../services/api';
import { PlanResponse } from '../types/plan';
import { Button } from './Button';

interface EmailItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  destination?: string;
  defaultEmail?: string;
  defaultName?: string;
  plan?: PlanResponse | null;
}

export const EmailItineraryModal: React.FC<EmailItineraryModalProps> = ({
  isOpen,
  onClose,
  tripId,
  destination = 'Trip',
  defaultEmail = '',
  defaultName = '',
  plan = null,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter a valid recipient email address');
      return;
    }

    setLoading(true);
    try {
      let pdfBase64: string | undefined;
      let filename: string | undefined;

      if (plan) {
        try {
          const { generateTripPdfBase64 } = await import('../utils/generatePdf');
          const pdfData = generateTripPdfBase64(plan);
          if (pdfData) {
            pdfBase64 = pdfData.base64;
            filename = pdfData.filename;
          }
        } catch (pdfErr) {
          console.warn('Could not generate PDF base64 for attachment:', pdfErr);
        }
      }

      await sendTripEmailApi(
        tripId,
        email.trim(),
        name.trim() || undefined,
        pdfBase64,
        filename
      );
      setSentSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send itinerary email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSentSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white dark:bg-[#1d1d1f] rounded-3xl p-6 sm:p-7 border border-[#e8e8ed] dark:border-[#333336] shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!sentSuccess ? (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ff6b35]/10 text-[#ff6b35] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Email Trip Itinerary
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 mb-5">
                Send the full day-by-day plan, costs, and travel tips for <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">{destination}</strong> directly to your inbox or a travel buddy.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-1.5">
                    Recipient Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#ff6b35] focus:bg-white dark:focus:bg-[#1d1d1f] outline-none text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-1.5">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#ff6b35] focus:bg-white dark:focus:bg-[#1d1d1f] outline-none text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900/40 text-[12.5px] text-[#ff6b35] dark:text-orange-400">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Includes complete <strong>Printable PDF Itinerary</strong> attached to email</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="w-full justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF & Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Itinerary Email</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Itinerary Sent! 🎒
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1.5 mb-6 max-w-xs mx-auto">
                A rich itinerary for <strong>{destination}</strong> has been emailed to <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">{email}</strong>.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleClose}
                className="w-full justify-center"
              >
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
