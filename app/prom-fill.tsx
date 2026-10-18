import { createElement, useState } from 'react';
import { ActivityIndicator, Platform, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTheme } from '../theme/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { spacing } from '../theme/colors';
import { resolveWebAppBaseUrl } from '../api/host';

// react-native-webview is iOS/Android only — it refuses to render at all on
// web ("React Native WebView does not support this platform"). A plain
// <iframe> is the direct web equivalent, so render that instead when
// running via `expo start --web`. Built with createElement (not JSX) since
// 'iframe' isn't a recognized React Native component type.
function EmbeddedPage({ url, onLoad, style }: { url: string; onLoad: () => void; style: object }) {
  if (Platform.OS === 'web') {
    return createElement('iframe', { src: url, onLoad, style: { ...style, border: 'none' } });
  }
  return <WebView source={{ uri: url }} onLoadEnd={onLoad} style={style} />;
}

// The web app already has a fully working, tested public fill-in page for a
// PROM questionnaire (dynamic form + scoring — frontend/src/pages/PromPublicFill.jsx,
// routed at /prom/:token, talking directly to the public, unauthenticated
// backend/routers/prom_public.py). Rather than re-implement that form
// rendering + scoring logic natively, this screen just embeds that page —
// the patient's own PROMAssignment.accessToken is the same kind of link a
// doctor would otherwise text/print for them.
export default function PromFillScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { token, promName } = useLocalSearchParams<{ token: string; promName?: string }>();
  const [loading, setLoading] = useState(true);

  const webAppBaseUrl = resolveWebAppBaseUrl();
  const url = webAppBaseUrl ? `${webAppBaseUrl}/prom/${token}` : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
        backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
          {promName || t('misc.promFill.fallbackTitle')}
        </Text>
      </View>

      {!url ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Text style={{ color: colors.danger, textAlign: 'center' }}>
            {t('misc.promFill.configMissing')}
          </Text>
        </View>
      ) : (
        <>
          {loading && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          <EmbeddedPage
            url={url}
            onLoad={() => setLoading(false)}
            style={{ flex: 1, backgroundColor: colors.bg }}
          />
        </>
      )}
    </View>
  );
}
