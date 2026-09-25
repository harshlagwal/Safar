import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, googleAuthSchema } from '../validators/auth.schema.js';
import {
  signupUser,
  loginUser,
  getUserProfile,
  deleteUserAccount,
  requestPasswordReset,
  resetPasswordWithOtp,
  googleAuthUser,
} from '../services/auth.service.js';


export async function signup(req, res, next) {
  try {
    const validatedData = signupSchema.parse(req.body);
    const result = await signupUser(validatedData);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await requestPasswordReset(validatedData.email);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await resetPasswordWithOtp(validatedData);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await getUserProfile(req.user._id);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await deleteUserAccount(userId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req, res, next) {
  try {
    const validatedData = googleAuthSchema.parse(req.body);
    const result = await googleAuthUser(validatedData);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


