import axios from 'axios';

// Mirrors the web app's frontend/src/api.js interceptor pattern (bearer
// token attached per-request, drop the session on 401) but with the token
// held in memory + SecureStore instead of localStorage — see
// context/AuthContext.tsx, which is the only thing that calls setAuthToken.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn(
    'EXPO_PUBLIC_API_BASE_URL is not set — copy .env.example to .env and set it to your ' +
    'dev machine\'s LAN IP (localhost will not work from a physical device).'
  );
}

const api = axios.create({ baseURL: API_BASE_URL });

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only treat this as "the session died" if the FAILED request itself
    // carried a bearer token — checking the current `authToken` instead
    // would also fire for an unrelated 401 from an unauthenticated endpoint
    // (e.g. a stale duplicate /verify-otp call after login already
    // succeeded and set a token), wiping a perfectly valid session.
    const hadAuthHeader = Boolean(err.config?.headers?.Authorization);
    if (err.response?.status === 401 && hadAuthHeader) {
      authToken = null;
      onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);

export default api;
