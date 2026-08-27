import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/useTheme';
import { SessionProvider, useSession } from '../context/AuthContext';

function RootNavigator() {
  const { colors } = useTheme();
  const { token, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="report/[id]" />
        <Stack.Screen name="document/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="prom-fill" />
      </Stack.Protected>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();
  return (
    <SessionProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </SessionProvider>
  );
}
