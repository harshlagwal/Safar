import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
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
            onClick={deleting ? undefined : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-[440px] bg-white dark:bg-[#1d1d1f] rounded-3xl p-6 sm:p-7 border border-[#e8e8ed] dark:border-[#333336] shadow-[0_20px_60px_rgb(0,0,0,0.22)] z-10 space-y-5"
          >
            {/* Close Button */}
            {!deleting && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Warning Icon & Title */}
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  Delete Account?
                </h3>
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete your account?
                </p>
              </div>
            </div>

            {/* Warning Box */}
            <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-[12.5px] text-red-700 dark:text-red-300 leading-relaxed space-y-1">
              <p className="font-semibold">This action cannot be undone.</p>
              <p className="text-red-600/90 dark:text-red-400/90">
                All your profile details and all your saved travel itineraries will be permanently deleted from our database.
              </p>
            </div>

            {error && (
              <p className="text-[12px] text-red-500 font-medium">{error}</p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={deleting}
                onClick={onClose}
                className="cursor-pointer"
              >
                <span>Cancel</span>
              </Button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
