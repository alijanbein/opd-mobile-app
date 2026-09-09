import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { radius, spacing } from '../../theme/colors';
import { useSession } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function StaffLoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { staffLogin } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      await staffLogin(email.trim(), password);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || t('auth.staffLogin.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.lg }}>
        <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: spacing.xl }}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>
        <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>{t('auth.staffLogin.title')}</Text>
          <Text style={{ fontSize: 13.5, color: colors.textSecondary, textAlign: 'center' }}>{t('auth.staffLogin.subtitle')}</Text>
        </View>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('auth.staffLogin.emailPlaceholder')} placeholderTextColor={colors.textMuted} style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, color: colors.textPrimary }} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder={t('auth.staffLogin.passwordPlaceholder')} placeholderTextColor={colors.textMuted} style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, color: colors.textPrimary }} />
        {error ? <Text style={{ color: colors.danger, fontSize: 12.5 }}>{error}</Text> : null}
        <Pressable onPress={submit} disabled={loading || !email.trim() || !password} style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', opacity: loading || !email.trim() || !password ? 0.6 : 1 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14.5 }}>{t('auth.staffLogin.submit')}</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
