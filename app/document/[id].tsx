import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../theme/useTheme';
import { spacing } from '../../theme/colors';
import { useSession } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { documentFileUrl } from '../../api/patient';
import { downloadDocument } from '../../lib/downloadDocument';

export default function DocumentViewerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { token } = useSession();
  const { t } = useLanguage();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    downloadDocument(documentFileUrl(id), token, name || `${id}.jpg`)
      .then((file) => setUri(file.uri))
      .catch(() => setError(t('misc.document.loadError')));
  }, [id]);

  const share = async () => {
    if (!uri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
      }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
        {uri ? (
          <Pressable onPress={share} hitSlop={10}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </Pressable>
        ) : null}
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {error ? (
          <Text style={{ color: colors.danger }}>{error}</Text>
        ) : !uri ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        )}
      </View>
    </View>
  );
}
