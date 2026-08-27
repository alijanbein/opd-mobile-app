import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../theme/useTheme';
import { radius, spacing } from '../../theme/colors';
import { useSession } from '../../context/AuthContext';

export default function OtpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { phone: phoneParam, devOtp: devOtpParam } = useLocalSearchParams<{ phone: string; devOtp?: string }>();
  const phone = phoneParam ?? '';
  const { verifyOtp, requestOtp } = useSession();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | undefined>(devOtpParam);
  const [resending, setResending] = useState(false);
  // Synchronous re-entry guard — `loading` state alone doesn't prevent a
  // fast double-tap/double-fire from sending two verify-otp requests before
  // React re-renders with the button disabled (the OTP is single-use, so a
  // second call fails even with the right code).
  const submitting = useRef(false);

  const submit = async () => {
    if (!code.trim() || submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(phone, code.trim());
      // Stack.Protected in app/_layout.tsx swaps to the tabs once the
      // session's token is set — no explicit navigation needed here.
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Incorrect code — try again.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    try {
      const { devOtp: next } = await requestOtp(phone);
      setDevOtp(next);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.lg }}>
        <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: spacing.xl }}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>← Back</Text>
        </Pressable>

        <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Enter the code</Text>
          <Text style={{ fontSize: 13.5, color: colors.textSecondary, textAlign: 'center' }}>
            We sent a 6-digit code to {phone}
          </Text>
        </View>

        {devOtp ? (
          <View style={{ backgroundColor: colors.warningLight, borderRadius: radius.md, padding: spacing.md }}>
            <Text style={{ fontSize: 12, color: colors.warningDark, fontWeight: '700' }}>DEV MODE — no SMS provider configured</Text>
            <Text style={{ fontSize: 13, color: colors.textPrimary, marginTop: 4 }}>Your code is: {devOtp}</Text>
          </View>
        ) : null}

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="••••••"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          style={{
            borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
            borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14,
            fontSize: 22, letterSpacing: 8, textAlign: 'center', color: colors.textPrimary,
          }}
        />

        {error ? <Text style={{ color: colors.danger, fontSize: 12.5 }}>{error}</Text> : null}

        <Pressable
          onPress={submit}
          disabled={loading || code.trim().length < 4}
          style={{
            backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14,
            alignItems: 'center', opacity: loading || code.trim().length < 4 ? 0.6 : 1,
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14.5 }}>Verify</Text>}
        </Pressable>

        <Pressable onPress={resend} disabled={resending} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
            {resending ? 'Resending…' : "Didn't get a code? Resend"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
