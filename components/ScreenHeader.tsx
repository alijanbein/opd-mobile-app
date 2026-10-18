import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { spacing } from '../theme/colors';

export default function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.xl,
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: colors.textPrimary }}>{title}</Text>
        {subtitle ? (
          <Text style={{ fontSize: 13.5, color: colors.textSecondary, marginTop: 4, lineHeight: 18 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
