import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { radius, spacing } from '../../theme/colors';
import { useSession } from '../../context/AuthContext';

export default function PhoneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { requestOtp } = useSession();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { devOtp } = await requestOtp(phone.trim());
      const query = devOtp
        ? `phone=${encodeURIComponent(phone.trim())}&devOtp=${devOtp}`
        : `phone=${encodeURIComponent(phone.trim())}`;
      router.push(`/otp?${query}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Could not send a code — check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="medical" size={28} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Welcome back</Text>
          <Text style={{ fontSize: 13.5, color: colors.textSecondary, textAlign: 'center' }}>
            Enter the phone number on file with your clinic to sign in.
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.textSecondary }}>Phone number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+966 5X XXX XXXX"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoFocus
            style={{
              borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
              borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12,
              fontSize: 15, color: colors.textPrimary,
            }}
          />
        </View>

        {error ? <Text style={{ color: colors.danger, fontSize: 12.5 }}>{error}</Text> : null}

        <Pressable
          onPress={submit}
          disabled={loading || !phone.trim()}
          style={{
            backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14,
            alignItems: 'center', opacity: loading || !phone.trim() ? 0.6 : 1,
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14.5 }}>Send Code</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
