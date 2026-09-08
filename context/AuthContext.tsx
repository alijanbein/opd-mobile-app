import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as tokenStorage from '../lib/tokenStorage';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import * as patientApi from '../api/patient';
import type { AuthPatient, PatientProfile } from '../api/patient';

const TOKEN_KEY = 'patient_auth_token';

type Session = {
  token: string | null;
  patient: PatientProfile | AuthPatient | null;
  isLoading: boolean;
  requestOtp: (phone: string) => Promise<{ devOtp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  updateProfile: (email: string, address: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientProfile | AuthPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setPatient(null);
      tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await tokenStorage.getItem(TOKEN_KEY);
        if (stored) {
          setAuthToken(stored);
          const me = await patientApi.getMe();
          setToken(stored);
          setPatient(me);
        }
      } catch {
        setAuthToken(null);
        await tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const requestOtp = async (phone: string) => {
    const res = await patientApi.requestOtp(phone);
    return { devOtp: res.devOtp };
  };

  const verifyOtp = async (phone: string, code: string) => {
    const res = await patientApi.verifyOtp(phone, code);
    setAuthToken(res.access_token);
    await tokenStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setPatient(res.patient);
  };

  const updateProfile = async (email: string, address: string) => {
    const updated = await patientApi.updateMe(email, address);
    setPatient(updated);
  };

  const signOut = async () => {
    setAuthToken(null);
    await tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
    setToken(null);
    setPatient(null);
  };

  const value = useMemo(
    () => ({ token, patient, isLoading, requestOtp, verifyOtp, updateProfile, signOut }),
    [token, patient, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
