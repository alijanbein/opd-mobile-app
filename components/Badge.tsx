import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius } from '../theme/colors';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export default function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors } = useTheme();
  const map: Record<Tone, { bg: string; fg: string }> = {
    primary: { bg: colors.primaryLight, fg: colors.primaryDark },
    success: { bg: colors.successLight, fg: colors.success },
    warning: { bg: colors.warningLight, fg: colors.warning },
    danger: { bg: colors.dangerLight, fg: colors.danger },
    info: { bg: colors.infoLight, fg: colors.info },
    neutral: { bg: colors.surface2, fg: colors.textSecondary },
  };
  const { bg, fg } = map[tone];
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
