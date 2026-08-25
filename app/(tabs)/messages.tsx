import { Text, View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';

// Placeholder shell — chatbot behavior/backend is still being designed
// (see conversation notes). The input is present but disabled so the tab
// doesn't feel broken while that's decided.
export default function MessagesScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Messages" subtitle="Chat with your care assistant" />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: 14 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
          Chat is coming soon
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 }}>
          You&rsquo;ll be able to message your care team and get quick answers here.
        </Text>
      </View>

      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
      }}>
        <TextInput
          editable={false}
          placeholder="Message your care team…"
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1, backgroundColor: colors.surface2, borderRadius: radius.pill,
            paddingHorizontal: 16, paddingVertical: 10, fontSize: 13.5, color: colors.textMuted,
            borderWidth: 1, borderColor: colors.border,
          }}
        />
        <Pressable disabled style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.borderDark, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="send" size={16} color={colors.surface} />
        </Pressable>
      </View>
    </View>
  );
}
