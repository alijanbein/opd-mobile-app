import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing } from '../theme/colors';

export default function Card({ style, ...props }: ViewProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowOpacity: isDark ? 0 : 0.06,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
});
