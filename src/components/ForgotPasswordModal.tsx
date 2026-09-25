import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestForgotPassword, resetPassword } from '../services/auth';
import { Button } from './Button';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await requestForgotPassword(email.trim());
      setStep('verify');
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must contain at least one letter and one number');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setStep('success');
      if (onSuccess) {
        onSuccess(email.trim());
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setStep('request');
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

          {/* STEP 1: Enter Email */}
          {step === 'request' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ff6b35]/10 text-[#ff6b35] flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Reset your password
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 mb-5">
                Enter your account email and we will send you a 6-digit verification code via Brevo.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#ff6b35] focus:bg-white dark:focus:bg-[#1d1d1f] outline-none text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
                    />
                  </div>
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
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 'verify' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Enter verification code
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 mb-5">
                We sent a 6-digit code to <strong className="text-[#1d1d1f] dark:text-white">{email}</strong>. Please check your inbox or spam folder.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-1.5">
                    6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[8px] font-mono text-[22px] font-bold py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#ff6b35] outline-none text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 chars (letters + numbers)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#ff6b35] focus:bg-white dark:focus:bg-[#1d1d1f] outline-none text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px] pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="text-[#ff6b35] hover:underline font-medium"
                  >
                    Resend Code
                  </button>
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
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Password Reset Successful!
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1.5 mb-6 max-w-xs mx-auto">
                Your password has been securely updated. You can now log in using your new credentials.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleClose}
                className="w-full justify-center"
              >
                Sign In Now
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
