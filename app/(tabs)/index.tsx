import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ScreenHeader from '../../components/ScreenHeader';
import { useSession } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getActiveCare, getAppointment, getNotifications, getPromStatus, getPromTrend,
} from '../../api/patient';
import type { ActiveCareItem, PatientAppointment, PromStatus, PromTrend } from '../../api/patient';

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function NotificationBell() {
  const { colors } = useTheme();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getNotifications()
        .then((items) => setUnread(items.filter((n) => !n.isRead).length))
        .catch(() => {});
    }, [])
  );

  return (
    <Pressable onPress={() => router.push('/notifications')} hitSlop={10} style={{ paddingTop: 2 }}>
      <Ionicons name={unread > 0 ? 'notifications' : 'notifications-outline'} size={24} color={colors.textPrimary} />
      {unread > 0 && (
        <View style={{
          position: 'absolute', top: -2, right: -4, minWidth: 16, height: 16, borderRadius: 8,
          backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '800' }}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

function NextAppointmentCard({ appointment }: { appointment: PatientAppointment }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const days = daysUntil(appointment.date);
  const isPast = appointment.isPast ?? days < 0;
  const badgeLabel = isPast ? t('tabs.home.badge.past') : days === 0 ? t('tabs.home.badge.today') : days === 1 ? t('tabs.home.badge.tomorrow') : t('tabs.home.badge.inDays', { days });

  return (
    <Card style={{ padding: 0, overflow: 'hidden', borderColor: colors.primary }}>
      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t(isPast ? 'tabs.home.lastAppointment' : 'tabs.home.nextAppointment')}</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{badgeLabel}</Text>
        </View>
      </View>
      <View style={{ padding: spacing.lg, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
            {new Date(appointment.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}{appointment.time ? ` · ${appointment.time}` : ''}
          </Text>
        </View>
        {appointment.physicianName ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="person-outline" size={16} color={colors.textMuted} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{appointment.physicianName}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const PROM_STATUS_KEY: Record<PromStatus['status'], 'due' | 'overdue' | 'deferred'> = {
  sent_pending: 'due',
  overdue: 'overdue',
  assigned_to_clerk: 'due',
  deferred: 'deferred',
};

function PromReminderCard({ prom }: { prom: PromStatus }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const isOverdue = prom.status === 'overdue';
  const canStartInApp = prom.completionMethod === 'self_completion' && !!prom.accessToken;
  const statusLabel = t(`tabs.home.promStatus.${PROM_STATUS_KEY[prom.status]}`);

  return (
    <Card style={{ borderColor: isOverdue ? colors.danger : colors.warning, backgroundColor: isOverdue ? colors.dangerLight : colors.warningLight, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="clipboard-outline" size={20} color={isOverdue ? colors.danger : colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: 13.5 }}>
          {t('tabs.home.promReminder.title', { status: statusLabel })}{prom.promName ? `: ${prom.promName}` : ''}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
          {canStartInApp
            ? t('tabs.home.promReminder.fillPrompt', { name: prom.promName || `${prom.bodyArea} ${t('tabs.home.promReminder.questionnaireSuffix')}` })
            : t('tabs.home.promReminder.notSent')}
        </Text>
      </View>
      {canStartInApp && (
        <Pressable
          onPress={() => router.push(`/prom-fill?token=${prom.accessToken}&promName=${encodeURIComponent(prom.promName || '')}`)}
          style={{ backgroundColor: isOverdue ? colors.danger : colors.warning, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>{t('tabs.home.promReminder.fillFormButton')}</Text>
        </Pressable>
      )}
    </Card>
  );
}

const PROGRESS_LABEL = (trend: PromTrend | null, t: (key: string) => string) => {
  if (!trend || trend.improvement == null) return { label: t('tabs.home.progress.noData'), color: 'muted' as const };
  const better = trend.scoreDirection === 'higher_better' ? trend.improvement > 0 : trend.improvement < 0;
  if (trend.improvement === 0) return { label: t('tabs.home.progress.stable'), color: 'muted' as const };
  return better ? { label: t('tabs.home.progress.improving'), color: 'success' as const } : { label: t('tabs.home.progress.declining'), color: 'danger' as const };
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { patient } = useSession();
  const { t } = useLanguage();
  const [appointment, setAppointment] = useState<PatientAppointment | null>(null);
  const [prom, setProm] = useState<PromStatus | null>(null);
  const [activeCare, setActiveCare] = useState<ActiveCareItem[] | null>(null);
  const [trend, setTrend] = useState<PromTrend | null>(null);

  useFocusEffect(
    useCallback(() => {
      getAppointment().then(setAppointment).catch(() => {});
      getPromStatus().then(setProm).catch(() => {});
      getActiveCare().then(setActiveCare).catch(() => {});
      getPromTrend().then(setTrend).catch(() => {});
    }, [])
  );

  const progress = PROGRESS_LABEL(trend, t);
  const progressColor = progress.color === 'success' ? colors.success : progress.color === 'danger' ? colors.danger : colors.textMuted;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader
          title={t('tabs.home.greeting', { name: patient?.name?.split(' ')[0] ?? t('tabs.home.defaultName') })}
          subtitle={t('tabs.home.subtitle')}
          right={<NotificationBell />}
        />

        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.lg }}>
          {appointment ? <NextAppointmentCard appointment={appointment} /> : (
            <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <ActivityIndicator color={colors.primary} />
            </Card>
          )}

          {prom ? <PromReminderCard prom={prom} /> : null}

          {/* Quick stats */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="body-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>{t('tabs.home.quickStats.treating')}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>{patient?.bodyArea ?? '—'}</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.success} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('tabs.home.quickStats.activeCare')}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                {activeCare ? t(activeCare.length === 1 ? 'tabs.home.activeCare.oneItem' : 'tabs.home.activeCare.manyItems', { count: activeCare.length }) : '—'}
              </Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="trending-up-outline" size={20} color={colors.info} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('tabs.home.quickStats.progress')}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: progressColor }}>{progress.label}</Text>
            </Card>
          </View>

          {/* Current care plan */}
          {activeCare && activeCare.length > 0 && (
            <View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 }}>{t('tabs.home.activeCare.title')}</Text>
              <View style={{ gap: 10 }}>
                {activeCare.map((item) => (
                  <Card key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md }}>
                    <Ionicons
                      name={item.kind === 'treatment' ? 'medkit-outline' : 'flask-outline'}
                      size={22}
                      color={item.kind === 'treatment' ? colors.success : colors.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: 13.5 }}>{item.title}</Text>
                      {item.detail ? <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{item.detail}</Text> : null}
                    </View>
                    <Badge label={item.kind === 'treatment' ? t('tabs.home.activeCare.treatment') : t('tabs.home.activeCare.test')} tone={item.kind === 'treatment' ? 'success' : 'primary'} />
                  </Card>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
