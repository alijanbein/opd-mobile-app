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
  const days = daysUntil(appointment.date);
  const badgeLabel = days < 0 ? 'Past' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;

  return (
    <Card style={{ padding: 0, overflow: 'hidden', borderColor: colors.primary }}>
      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>NEXT APPOINTMENT</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{badgeLabel}</Text>
        </View>
      </View>
      <View style={{ padding: spacing.lg, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
            {new Date(appointment.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })} · {appointment.time}
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

const PROM_STATUS_LABEL: Record<PromStatus['status'], string> = {
  sent_pending: 'due',
  overdue: 'overdue',
  assigned_to_clerk: 'due',
  deferred: 'deferred',
};

function PromReminderCard({ prom }: { prom: PromStatus }) {
  const { colors } = useTheme();
  const router = useRouter();
  const isOverdue = prom.status === 'overdue';
  const canStartInApp = prom.completionMethod === 'self_completion' && !!prom.accessToken;

  return (
    <Card style={{ borderColor: isOverdue ? colors.danger : colors.warning, backgroundColor: isOverdue ? colors.dangerLight : colors.warningLight, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="clipboard-outline" size={20} color={isOverdue ? colors.danger : colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: 13.5 }}>
          Check-in {PROM_STATUS_LABEL[prom.status]}{prom.promName ? `: ${prom.promName}` : ''}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
          {canStartInApp
            ? `A few quick questions about your ${prom.bodyArea.toLowerCase()}`
            : 'Your care team will complete this with you at your next visit'}
        </Text>
      </View>
      {canStartInApp && (
        <Pressable
          onPress={() => router.push(`/prom-fill?token=${prom.accessToken}&promName=${encodeURIComponent(prom.promName || '')}`)}
          style={{ backgroundColor: isOverdue ? colors.danger : colors.warning, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>Start</Text>
        </Pressable>
      )}
    </Card>
  );
}

const PROGRESS_LABEL = (trend: PromTrend | null) => {
  if (!trend || trend.improvement == null) return { label: 'No data yet', color: 'muted' as const };
  const better = trend.scoreDirection === 'higher_better' ? trend.improvement > 0 : trend.improvement < 0;
  if (trend.improvement === 0) return { label: 'Stable', color: 'muted' as const };
  return better ? { label: 'Improving', color: 'success' as const } : { label: 'Declining', color: 'danger' as const };
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { patient } = useSession();
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

  const progress = PROGRESS_LABEL(trend);
  const progressColor = progress.color === 'success' ? colors.success : progress.color === 'danger' ? colors.danger : colors.textMuted;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader
          title={`Hi, ${patient?.name?.split(' ')[0] ?? 'there'}`}
          subtitle="Here's where things stand with your care"
          right={<NotificationBell />}
        />

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
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
              <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>Treating</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>{patient?.bodyArea ?? '—'}</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.success} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Active Care</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                {activeCare ? `${activeCare.length} item${activeCare.length === 1 ? '' : 's'}` : '—'}
              </Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="trending-up-outline" size={20} color={colors.info} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Progress</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: progressColor }}>{progress.label}</Text>
            </Card>
          </View>

          {/* Current care plan */}
          {activeCare && activeCare.length > 0 && (
            <View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 }}>Your Care Plan</Text>
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
                    <Badge label={item.kind === 'treatment' ? 'Treatment' : 'Test'} tone={item.kind === 'treatment' ? 'success' : 'primary'} />
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
