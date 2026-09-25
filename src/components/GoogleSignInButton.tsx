import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface GoogleSignInButtonProps {
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (msg: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onStart,
  onFinish,
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Monitor dark mode class on html tag
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setInlineError(null);
    if (!credentialResponse.credential) {
      const msg = 'Google login fail ho gaya, dobara try karein';
      setInlineError(msg);
      onError?.(msg);
      return;
    }

    try {
      setLoading(true);
      onStart?.();
      const user = await loginWithGoogle(credentialResponse.credential);
      showToast(`Welcome, ${user.name}!`, 'success');
      navigate('/trips');
    } catch (err: any) {
      const msg = err?.message || 'Google login fail ho gaya, dobara try karein';
      setInlineError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
      onFinish?.();
    }
  };


  const handleError = () => {
    const msg = 'Google login fail ho gaya, dobara try karein';
    setInlineError(msg);
    onError?.(msg);
  };

  return (
    <div className="w-full mt-4">
      {/* Apple-style divider: "— ya phir —" */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e8e8ed] dark:border-[#333336]" />
        </div>
        <div className="relative px-3 bg-white dark:bg-[#1d1d1f] text-[12px] text-[#86868b]">
          — ya phir —
        </div>
      </div>

      {/* Inline Error Banner */}
      {inlineError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[12.5px] font-medium text-center"
        >
          {inlineError}
        </motion.div>
      )}

      {/* Google Button Container */}
      {!clientId ? (
        <div className="w-full h-[48px] rounded-full border border-dashed border-[#e8e8ed] dark:border-[#333336] bg-[#f9f9fb] dark:bg-[#151517] flex items-center justify-center gap-2.5 px-4 text-[13px] text-[#86868b]">
          <GoogleIcon className="w-4 h-4 opacity-50" />
          <span>Google Sign-In (Waiting for Client ID)</span>
        </div>
      ) : (
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="w-full flex justify-center items-center min-h-[48px] [&>div]:!w-full [&_iframe]:!rounded-full transition-transform"
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme={isDark ? 'filled_black' : 'outline'}
            shape="pill"
            size="large"
            text="continue_with"
            width="100%"
            useOneTap={false}
          />
        </motion.div>
      )}
    </div>
  );
};

// Official 4-color Google G Icon
function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
