import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Metro (the dev server) always knows the LAN IP the phone/emulator actually
// connected through — Constants.expoConfig.hostUri carries it as
// "<ip>:<metroPort>". Deriving the backend/web-app URLs from that host means
// this app keeps working after a network change (new WiFi, hotspot, etc.)
// without ever touching a .env file — just restart `expo start`.
// EXPO_PUBLIC_*_BASE_URL still wins when set, for prod/EAS builds where
// there is no dev server to introspect.
const API_PORT = 8000;
const WEB_APP_PORT = 5173;

function getDevServerHost(): string | null {
  // expo-constants' web shim never has a manifest (see ExponentConstants.web.ts —
  // `manifest` is just `process.env.APP_MANIFEST || {}`), so expoConfig/hostUri
  // is always null there. On web the address bar's own host IS the dev
  // machine's reachable address though — whatever hostname/IP loaded this
  // page is exactly what the backend is reachable at too.
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.location.hostname || null : null;
  }
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  return hostUri ? hostUri.split(':')[0] || null : null;
}

export function resolveApiBaseUrl(): string | undefined {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  const host = getDevServerHost();
  return host ? `http://${host}:${API_PORT}` : undefined;
}

export function resolveWebAppBaseUrl(): string | undefined {
  if (process.env.EXPO_PUBLIC_WEB_APP_BASE_URL) return process.env.EXPO_PUBLIC_WEB_APP_BASE_URL;
  const host = getDevServerHost();
  return host ? `http://${host}:${WEB_APP_PORT}` : undefined;
}
