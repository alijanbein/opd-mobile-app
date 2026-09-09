import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { radius, spacing } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n';

const OPTIONS: { code: Language; nativeLabel: string; sublabel: string }[] = [
  { code: 'en', nativeLabel: 'English', sublabel: 'Continue in English' },
  { code: 'ar', nativeLabel: 'العربية', sublabel: 'المتابعة باللغة العربية' },
];

// First-launch, pre-auth gate — shown once before the phone/OTP or staff
// login screens (see the top-level Stack.Protected guard in app/_layout.tsx
// keyed on LanguageContext's hasChosenLanguage). The same choice is also
// editable later from Profile > Preferences > Language.
export default function LanguageSelectScreen() {
  const { colors } = useTheme();
  const { setLanguage, t } = useLanguage();
  const [choosing, setChoosing] = useState<Language | null>(null);

  const choose = async (code: Language) => {
    setChoosing(code);
    // setLanguage flips hasChosenLanguage, which the root layout's guard
    // reacts to immediately — no manual navigation needed here.
    await setLanguage(code);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.lg }}>
      <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="language" size={28} color={colors.primary} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>{t('common.chooseLanguage')}</Text>
        <Text style={{ fontSize: 13.5, color: colors.textSecondary, textAlign: 'center' }}>{t('common.chooseLanguageSubtitle')}</Text>
      </View>

      <View style={{ gap: spacing.md }}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.code}
            onPress={() => choose(opt.code)}
            disabled={choosing !== null}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: spacing.md,
              borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
              borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: spacing.lg,
              opacity: choosing && choosing !== opt.code ? 0.5 : 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{opt.nativeLabel}</Text>
              <Text style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>{opt.sublabel}</Text>
            </View>
            {choosing === opt.code ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
