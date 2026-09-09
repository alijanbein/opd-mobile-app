import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/useTheme';
import { SessionProvider, useSession } from '../context/AuthContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

function RootNavigator() {
  const { colors } = useTheme();
  const { token, staffToken, isLoading: sessionLoading } = useSession();
  const { hasChosenLanguage, isLoading: languageLoading } = useLanguage();

  if (sessionLoading || languageLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* First launch only — everything else waits behind this, including
          the auth screens, so the choice is made before a phone/OTP or
          staff-login prompt ever shows. See app/language-select.tsx. */}
      <Stack.Protected guard={!hasChosenLanguage}>
        <Stack.Screen name="language-select" />
      </Stack.Protected>
      <Stack.Protected guard={hasChosenLanguage && !!staffToken}>
        <Stack.Screen name="admin/add-patient" />
      </Stack.Protected>
      <Stack.Protected guard={hasChosenLanguage && !!token && !staffToken}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="report/[id]" />
        <Stack.Screen name="document/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="prom-fill" />
      </Stack.Protected>
      <Stack.Protected guard={hasChosenLanguage && !token && !staffToken}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();
  return (
    <LanguageProvider>
      <SessionProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </SessionProvider>
    </LanguageProvider>
  );
}
