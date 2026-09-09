import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as tokenStorage from '../lib/tokenStorage';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import * as patientApi from '../api/patient';
import * as staffApi from '../api/staff';
import type { AuthPatient, PatientProfile } from '../api/patient';
import type { StaffUser } from '../api/staff';

const TOKEN_KEY = 'patient_auth_token';
const STAFF_TOKEN_KEY = 'staff_auth_token';

type Session = {
  token: string | null;
  staffToken: string | null;
  staffUser: StaffUser | null;
  isStaffAdmin: boolean;
  patient: PatientProfile | AuthPatient | null;
  isLoading: boolean;
  requestOtp: (phone: string) => Promise<{ devOtp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  staffLogin: (email: string, password: string) => Promise<void>;
  updateProfile: (email: string, address: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [staffToken, setStaffToken] = useState<string | null>(null);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [patient, setPatient] = useState<PatientProfile | AuthPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setPatient(null);
      setStaffToken(null);
      setStaffUser(null);
      tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
      tokenStorage.deleteItem(STAFF_TOKEN_KEY).catch(() => {});
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedStaff = await tokenStorage.getItem(STAFF_TOKEN_KEY);
        if (storedStaff) {
          setAuthToken(storedStaff);
          try {
            const staff = await staffApi.getMe();
            setStaffToken(storedStaff);
            setStaffUser(staff);
          } catch (err: any) {
            // Only drop the stored credential on a confirmed auth failure —
            // a transient network error at launch (timeout, offline) must
            // not force an unnecessary re-login, and must never touch the
            // *other* session's token (this used to unconditionally delete
            // the patient key here regardless of which branch failed, or
            // why).
            if (err?.response?.status === 401) {
              await tokenStorage.deleteItem(STAFF_TOKEN_KEY).catch(() => {});
            }
            setAuthToken(null);
          }
          return;
        }
        const stored = await tokenStorage.getItem(TOKEN_KEY);
        if (stored) {
          setAuthToken(stored);
          try {
            const me = await patientApi.getMe();
            setToken(stored);
            setPatient(me);
          } catch (err: any) {
            if (err?.response?.status === 401) {
              await tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
            }
            setAuthToken(null);
          }
        }
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

  const staffLogin = async (email: string, password: string) => {
    const res = await staffApi.login(email, password);
    if (!['physician', 'nurse'].includes(res.user.role)) {
      throw new Error('Only doctor and nurse accounts can use the mobile admin area.');
    }
    setAuthToken(res.access_token);
    await tokenStorage.setItem(STAFF_TOKEN_KEY, res.access_token);
    setStaffToken(res.access_token);
    setStaffUser(res.user);
  };

  const updateProfile = async (email: string, address: string) => {
    const updated = await patientApi.updateMe(email, address);
    setPatient(updated);
  };

  const signOut = async () => {
    setAuthToken(null);
    await tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
    await tokenStorage.deleteItem(STAFF_TOKEN_KEY).catch(() => {});
    setToken(null);
    setPatient(null);
    setStaffToken(null);
    setStaffUser(null);
  };

  const value = useMemo(
    () => ({ token, staffToken, staffUser, isStaffAdmin: !!staffUser && ['physician', 'nurse'].includes(staffUser.role), patient, isLoading, requestOtp, verifyOtp, staffLogin, updateProfile, signOut }),
    [token, staffToken, staffUser, patient, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
