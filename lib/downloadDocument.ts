import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';

// expo-file-system's SDK 57 File/Directory API (the old FileSystem.downloadAsync
// functional API is deprecated and throws at runtime) doesn't have a
// "download with a custom header" convenience for authenticated URLs, so we
// fetch the bytes ourselves via expo/fetch and write them to a cache file —
// see https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/.
export async function downloadDocument(url: string, token: string | null, filename: string): Promise<File> {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Failed to download document (${res.status})`);
  }
  const bytes = await res.bytes();
  const file = new File(Paths.cache, filename);
  if (file.exists) {
    file.delete();
  }
  file.write(bytes);
  return file;
}
