import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { AuthSlideshow } from '../components/AuthSlideshow';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { GoogleSignInButton } from '../components/GoogleSignInButton';


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const state = location.state as { email?: string; registered?: boolean; from?: any } | undefined;
  const [email, setEmail] = useState(state?.email || '');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(!!state?.registered);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already logged in, redirect
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/trips';
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRegisteredSuccess(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const from = (location.state as any)?.from?.pathname || '/trips';
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Email ya password galat hai');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 flex items-center justify-center bg-[#fafafa] dark:bg-[#000000]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[850px] bg-white dark:bg-[#1d1d1f] rounded-3xl p-3 sm:p-4 border border-[#e8e8ed] dark:border-[#333336] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none flex flex-col md:flex-row items-stretch gap-4"
      >
        {/* Left Side: 3 Auto-Changing Slideshow */}
        <AuthSlideshow />

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-8">
          <div>
            {/* Header with Logo */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 mb-6">
              <Link
                to="/"
                aria-label="Safar — home"
                className="group cursor-pointer transition-transform duration-200 hover:scale-105 mb-1"
              >
                <Logo variant="full" height={30} />
              </Link>
              <div>
                <h1 className="text-[22px] sm:text-[24px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
                  Sign in to access your saved Indian travel itineraries
                </p>
              </div>
            </div>

            {/* Registration Success Banner */}
            {registeredSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-emerald-700 dark:text-emerald-400 text-[12.5px] font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-snug">
                  Account created successfully! Please enter your password to sign in.
                </span>
              </motion.div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2 text-red-600 dark:text-red-400 text-[12.5px] font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[12.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1"
                >
                  Email address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f9f9fb] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]/60 dark:placeholder:text-[#a1a1a6]/40 text-[14px] rounded-xl border border-[#e8e8ed] dark:border-[#333336] pl-9.5 pr-4 py-2.5 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="login-password"
                    className="block text-[12.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[12px] font-medium text-[#ff6b35] hover:text-[#e45525] hover:underline cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f9f9fb] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]/60 dark:placeholder:text-[#a1a1a6]/40 text-[14px] rounded-xl border border-[#e8e8ed] dark:border-[#333336] pl-9.5 pr-4 py-2.5 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="w-full shadow-md shadow-[#ff6b35]/20 cursor-pointer text-[14px] py-2.5"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Google Sign-In */}
            <GoogleSignInButton />
          </div>

          {/* Bottom link to signup */}
          <div className="mt-6 pt-4 border-t border-[#e8e8ed] dark:border-[#333336] text-center">

            <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">
              Don’t have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[#ff6b35] hover:text-[#e45525] transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
        onSuccess={(resetEmail) => {
          setEmail(resetEmail);
          setRegisteredSuccess(false);
          setShowForgotModal(false);
        }}
      />
    </div>
  );
};
