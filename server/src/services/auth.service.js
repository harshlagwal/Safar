import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';
import { env } from '../config/env.js';
import { sendWelcomeEmail, sendOtpEmail } from './email.service.js';
import { verifyGoogleToken } from './google.service.js';

export async function signupUser({ name, email, password }) {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.code = 'EMAIL_TAKEN';
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // Non-blocking welcome email (fire-and-forget: never blocks signup response or fails if email service is down)
  sendWelcomeEmail({ toEmail: user.email, userName: user.name }).catch((err) => {
    console.warn('[Auth] Non-blocking welcome email failed:', err?.message || err);
  });

  // Sign JWT { sub: user._id } with 7-day expiry
  const token = jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

export async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

export async function deleteUserAccount(userId) {
  // Delete all trips associated with this user
  await Trip.deleteMany({ userId });

  // Delete the user
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    const error = new Error('User not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return { success: true, message: 'Account and associated trips deleted permanently' };
}

export async function requestPasswordReset(email) {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  if (!normalizedEmail) {
    const error = new Error('Email is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // For security, do not disclose if email exists
    return {
      success: true,
      message: 'If an account exists with this email, a verification code has been sent.',
    };
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 8);

  user.resetPasswordOtp = hashedOtp;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send OTP Email via Brevo
  const emailRes = await sendOtpEmail({
    toEmail: user.email,
    userName: user.name,
    otp,
  });

  if (!emailRes.success) {
    console.warn('[Auth Service] OTP email sending had issues:', emailRes.error || emailRes.reason);
  }

  return {
    success: true,
    message: 'A 6-digit verification code has been sent to your email.',
  };
}

export async function resetPasswordWithOtp({ email, otp, newPassword }) {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !otp || !newPassword) {
    const error = new Error('Email, OTP code, and new password are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
    const error = new Error('Invalid or expired verification code');
    error.code = 'INVALID_OTP';
    throw error;
  }

  if (user.resetPasswordExpires < new Date()) {
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();
    const error = new Error('Verification code has expired. Please request a new one.');
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  const isMatch = await bcrypt.compare(otp.trim(), user.resetPasswordOtp);
  if (!isMatch) {
    const error = new Error('Invalid verification code');
    error.code = 'INVALID_OTP';
    throw error;
  }

  // Hash new password and clear reset state
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordOtp = null;
  user.resetPasswordExpires = null;
  await user.save();

  return {
    success: true,
    message: 'Password has been reset successfully! You can now sign in with your new password.',
  };
}

export async function googleAuthUser({ credential }) {
  // 1. Verify Google token
  const payload = await verifyGoogleToken(credential);

  // 2. Find user by googleId or lowercase email
  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email }],
  });

  if (user) {
    // 3. Link account: update googleId or avatarUrl if missing
    let updated = false;
    if (!user.googleId) {
      user.googleId = payload.sub;
      updated = true;
    }
    if (!user.avatarUrl && payload.picture) {
      user.avatarUrl = payload.picture;
      updated = true;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  } else {
    // Create new Google-authenticated user
    user = await User.create({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      avatarUrl: payload.picture,
      provider: 'google',
      isVerified: true,
    });

    // Optional fire-and-forget welcome email
    sendWelcomeEmail({ toEmail: user.email, userName: user.name }).catch((err) => {
      console.warn('[Auth] Non-blocking welcome email failed for Google user:', err?.message || err);
    });
  }

  // Sign JWT { sub: user._id } with 7-day expiry
  const token = jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
    },
  };
}


