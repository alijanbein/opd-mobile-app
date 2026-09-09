import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { radius, spacing } from '../../theme/colors';
import { useSession } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PhoneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
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
      setError(e?.response?.data?.detail || t('auth.phone.error'));
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
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>{t('auth.phone.title')}</Text>
          <Text style={{ fontSize: 13.5, color: colors.textSecondary, textAlign: 'center' }}>
            {t('auth.phone.subtitle')}
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.textSecondary }}>{t('auth.phone.label')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t('auth.phone.placeholder')}
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14.5 }}>{t('auth.phone.submit')}</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/staff-login')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>{t('auth.phone.staffLogin')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
