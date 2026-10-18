import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { radius, spacing } from '../../theme/colors';
import { useSession } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MrnScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { requestOtp } = useSession();
  const [mrn, setMrn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!mrn.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { devOtp } = await requestOtp(mrn.trim());
      const query = devOtp
        ? `mrn=${encodeURIComponent(mrn.trim())}&devOtp=${devOtp}`
        : `mrn=${encodeURIComponent(mrn.trim())}`;
      router.push(`/otp?${query}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || t('auth.mrn.error'));
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
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>{t('auth.mrn.title')}</Text>
          <Text style={{ fontSize: 13.5, color: colors.textSecondary, textAlign: 'center' }}>
            {t('auth.mrn.subtitle')}
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.textSecondary }}>{t('auth.mrn.label')}</Text>
          <TextInput
            value={mrn}
            onChangeText={setMrn}
            placeholder={t('auth.mrn.placeholder')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
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
          disabled={loading || !mrn.trim()}
          style={{
            backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14,
            alignItems: 'center', opacity: loading || !mrn.trim() ? 0.6 : 1,
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14.5 }}>{t('auth.mrn.submit')}</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/staff-login')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>{t('auth.mrn.staffLogin')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
