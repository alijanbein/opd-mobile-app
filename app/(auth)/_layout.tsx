import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Explicit children, in order — without them expo-router falls back to
  // file order (alphabetical) within this group, which would put "otp"
  // before "mrn" and skip straight to the code-entry screen with no
  // MRN set.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mrn" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="staff-login" />
    </Stack>
  );
}
