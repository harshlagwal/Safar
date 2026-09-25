import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, AlertCircle, Check, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { AuthSlideshow } from '../components/AuthSlideshow';
import { TermsModal } from '../components/TermsModal';
import { GoogleSignInButton } from '../components/GoogleSignInButton';


export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Apple-style Terms & Conditions Modal state
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // If already logged in, redirect
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/trips';
    navigate(from, { replace: true });
  }

  // Password requirement validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      setErrorMessage('Name must be between 2 and 50 characters');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 8 characters with at least one letter and one number');
      return;
    }

    // Require accepting Terms & Conditions (Apple style)
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }

    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
      showToast('Account created successfully! Please sign in.', 'success');
      navigate('/login', {
        state: {
          email: email.trim(),
          registered: true,
          from: (location.state as any)?.from,
        },
        replace: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTerms(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 flex items-center justify-center bg-[#fafafa] dark:bg-[#000000]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[890px] bg-white dark:bg-[#1d1d1f] rounded-3xl p-3 sm:p-4 border border-[#e8e8ed] dark:border-[#333336] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none flex flex-col md:flex-row items-stretch gap-4"
      >
        {/* Left Side: 3 Auto-Changing Slideshow */}
        <AuthSlideshow />

        {/* Right Side: Signup Form */}
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-7">
          <div>
            {/* Header with Logo */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 mb-5">
              <Link
                to="/"
                aria-label="Safar — home"
                className="group cursor-pointer transition-transform duration-200 hover:scale-105 mb-0.5"
              >
                <Logo variant="full" height={28} />
              </Link>
              <div>
                <h1 className="text-[21px] sm:text-[23px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  Create your account
                </h1>
                <p className="text-[12.5px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
                  Save, sync and share your personalized Indian journeys
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3.5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2 text-red-600 dark:text-red-400 text-[12.5px] font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1"
                >
                  Full name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f9f9fb] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]/60 dark:placeholder:text-[#a1a1a6]/40 text-[13.5px] rounded-xl border border-[#e8e8ed] dark:border-[#333336] pl-9.5 pr-4 py-2 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1"
                >
                  Email address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f9f9fb] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]/60 dark:placeholder:text-[#a1a1a6]/40 text-[13.5px] rounded-xl border border-[#e8e8ed] dark:border-[#333336] pl-9.5 pr-4 py-2 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f9f9fb] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]/60 dark:placeholder:text-[#a1a1a6]/40 text-[13.5px] rounded-xl border border-[#e8e8ed] dark:border-[#333336] pl-9.5 pr-4 py-2 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all"
                    required
                  />
                </div>

                {/* Compact Password Criteria */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px]">
                  <span
                    className={`flex items-center gap-1 ${
                      hasMinLength
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[#86868b] dark:text-[#a1a1a6]'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-40'}`} />
                    8+ chars
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      hasLetter
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[#86868b] dark:text-[#a1a1a6]'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${hasLetter ? 'opacity-100' : 'opacity-40'}`} />
                    1 letter
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      hasNumber
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[#86868b] dark:text-[#a1a1a6]'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-40'}`} />
                    1 number
                  </span>
                </div>
              </div>

              {/* Apple-style Terms & Conditions Text (Not an ugly button) */}
              <div className="pt-1.5">
                <div className="flex items-start gap-2">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-[#e8e8ed] dark:border-[#333336] text-[#ff6b35] focus:ring-[#ff6b35]/20 cursor-pointer accent-[#ff6b35]"
                  />
                  <label htmlFor="terms-checkbox" className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] leading-tight select-none">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTerms(true);
                      }}
                      className="text-[#ff6b35] hover:text-[#e45525] underline font-medium cursor-pointer"
                    >
                      Terms & Conditions
                    </button>{' '}
                    and Privacy Policy.
                  </label>
                </div>
                {termsAccepted && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium pl-5.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Terms reviewed and accepted</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="w-full shadow-md shadow-[#ff6b35]/20 cursor-pointer text-[13.5px] py-2.5"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Create account</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Google Sign-In */}
            <GoogleSignInButton />
          </div>

          {/* Bottom link to login */}
          <div className="mt-5 pt-3.5 border-t border-[#e8e8ed] dark:border-[#333336] text-center">

            <p className="text-[12.5px] text-[#86868b] dark:text-[#a1a1a6]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#ff6b35] hover:text-[#e45525] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Apple-style Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  );
};
