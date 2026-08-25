import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './colors';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark };
}
