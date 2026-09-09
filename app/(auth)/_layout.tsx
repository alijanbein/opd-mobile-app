import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Explicit children, in order — without them expo-router falls back to
  // file order (alphabetical) within this group, which would put "otp"
  // before "phone" and skip straight to the code-entry screen with no
  // phone number set.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="staff-login" />
    </Stack>
  );
}
