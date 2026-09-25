import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  getToken,
  setToken as saveToken,
  removeToken,
  login as loginService,
  signup as signupService,
  googleAuth as googleAuthService,
  getMe,
  deleteAccountApi,
} from '../services/auth';
import { clearAllSavedTrips, setCurrentPlan } from '../services/storage';

import { removeStoredGeminiApiKey } from '../services/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = getToken();
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await getMe();
        if (isMounted) {
          setUser(data.user);
          setTokenState(storedToken);
        }
      } catch (err) {
        // on failure logout silently
        removeToken();
        clearAllSavedTrips();
        if (isMounted) {
          setUser(null);
          setTokenState(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginService(email, password);
    setUser(res.user);
    setTokenState(res.token);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string): Promise<User> => {
    const res = await googleAuthService(credential);
    setUser(res.user);
    setTokenState(res.token);
    return res.user;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await signupService(name, email, password);
    removeToken();
    clearAllSavedTrips();
    removeStoredGeminiApiKey();
    setUser(null);
    setTokenState(null);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    clearAllSavedTrips();
    setCurrentPlan(null);
    removeStoredGeminiApiKey();
    setUser(null);
    setTokenState(null);
    navigate('/');
  }, [navigate]);

  const deleteAccount = useCallback(async () => {
    await deleteAccountApi();
    removeToken();
    clearAllSavedTrips();
    setCurrentPlan(null);
    removeStoredGeminiApiKey();
    setUser(null);
    setTokenState(null);
    navigate('/');
  }, [navigate]);

  const authValue = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      loginWithGoogle,
      signup,
      logout,
      deleteAccount,
    }),
    [user, token, loading, login, loginWithGoogle, signup, logout, deleteAccount]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
