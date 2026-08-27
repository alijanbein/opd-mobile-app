import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation (its web module is a literal
// empty object — https://github.com/expo/expo, ExpoSecureStore.web.ts),
// so every call throws there. Fall back to localStorage on web; native
// platforms keep using the real Keychain/Keystore-backed SecureStore.
// localStorage isn't encrypted, so this is only appropriate for the dev/web
// target, never a substitute for SecureStore's guarantees on a real device.
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}
