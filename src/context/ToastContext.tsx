import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, AlertCircle } from 'lucide-react';

interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastContextValue {
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="toast-container"
        className="fixed top-6 inset-x-0 z-50 flex flex-col items-center pointer-events-none space-y-2 px-4"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-auto flex items-center space-x-2 bg-[#1d1d1f] dark:bg-[#1d1d1f] text-white dark:text-[#f5f5f7] px-4 py-2 rounded-full shadow-lg border border-white/10 dark:border-[#333336] text-[14px] font-medium tracking-tight"
            >
              {toast.type === 'success' ? (
                <Check className="w-4 h-4 text-[#34c759] stroke-[2.5]" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-[#ff3b30]" />
              ) : (
                <Info className="w-4 h-4 text-[#ff6b35]" />
              )}
              <span>{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
