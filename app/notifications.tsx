import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { spacing, radius } from '../theme/colors';
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from '../api/patient';
import type { PatientNotification } from '../api/patient';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<PatientNotification[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getNotifications();
    setItems(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openNotification = async (n: PatientNotification) => {
    if (!n.isRead) {
      setItems((prev) => prev?.map((it) => (it.id === n.id ? { ...it, isRead: true } : it)) ?? prev);
      markNotificationRead(n.id).catch(() => {});
    }
    if (n.relatedType === 'chat_message') {
      router.push('/(tabs)/messages');
      return;
    }
    if (n.relatedId) {
      const prefix = n.relatedType === 'surgery_evaluation' ? 'surg' : 'eval';
      router.push(`/report/${prefix}-${n.relatedId}`);
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev?.map((it) => ({ ...it, isRead: true })) ?? prev);
    await markAllNotificationsRead().catch(() => {});
  };

  const hasUnread = items?.some((n) => !n.isRead);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
        backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{t('misc.notifications.title')}</Text>
        </View>
        {hasUnread ? (
          <Pressable onPress={markAllRead}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12.5 }}>{t('misc.notifications.markAllRead')}</Text>
          </Pressable>
        ) : null}
      </View>

      {items === null ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.sm }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, gap: 8 }}>
              <Ionicons name="notifications-outline" size={28} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('misc.notifications.empty')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openNotification(item)}
              style={{
                flexDirection: 'row', gap: 10, padding: spacing.md,
                backgroundColor: colors.surface, borderRadius: radius.lg,
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 }} />}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: item.isRead ? '600' : '800', color: colors.textPrimary }}>{item.title}</Text>
                {item.body ? (
                  <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>{item.body}</Text>
                ) : null}
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>{item.createdAt}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
