import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ScreenHeader from '../../components/ScreenHeader';
import { mockJourney, mockTrendEvents, mockTrendPoints } from '../../data/mockData';
import type { OrderStatus } from '../../types';

const STATUS_TONE: Record<OrderStatus, 'success' | 'warning' | 'primary' | 'neutral'> = {
  completed: 'success',
  active: 'primary',
  pending: 'warning',
  scheduled: 'neutral',
};

function TrendMini() {
  const { colors } = useTheme();
  const known = mockTrendPoints.filter((p) => p.score !== null);
  const w = 320, h = 90, padX = 24, padY = 16;
  const maxIdx = mockTrendPoints.length - 1;
  const x = (i: number) => padX + (i / maxIdx) * (w - padX * 2);
  const y = (s: number) => padY + (1 - s / 100) * (h - padY * 2);

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>Your Progress</Text>
        {known.length >= 2 && (
          <Badge
            label={`${known[known.length - 1].score! - known[0].score! >= 0 ? '▲ +' : '▼ '}${known[known.length - 1].score! - known[0].score!} from baseline`}
            tone="success"
          />
        )}
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6 }}>
        Missing check-ins show as gaps — we never invent a score.
      </Text>
      {mockTrendEvents.map((ev) => (
        <Text key={ev.label} style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>
          🔹 {ev.label} — {ev.date}
        </Text>
      ))}
    </Card>
  );
}

export default function JourneyScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader title="Your Journey" subtitle="Visits, check-ins, and what your doctor has asked for" />

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
          <TrendMini />

          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 }}>Visit Timeline</Text>
            <View>
              {mockJourney.map((visit, i) => (
                <View key={visit.id} style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'center', width: 20 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 }} />
                    {i < mockJourney.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 }} />}
                  </View>
                  <Card style={{ flex: 1, marginBottom: spacing.md }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>{visit.date}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 2 }}>{visit.type}</Text>
                        {visit.diagnosis && <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 3 }}>{visit.diagnosis}</Text>}
                        {visit.physician && <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>{visit.physician}</Text>}
                      </View>
                      {visit.promScore !== null && visit.promScore !== undefined && (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.primary }}>{visit.promScore}</Text>
                          <Text style={{ fontSize: 9, color: colors.textMuted }}>/ 100</Text>
                        </View>
                      )}
                    </View>

                    {visit.orders.length > 0 && (
                      <View style={{ marginTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                        {visit.orders.map((o) => (
                          <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 16 }}>{o.icon}</Text>
                            <Text style={{ flex: 1, fontSize: 12.5, color: colors.textPrimary, fontWeight: '600' }}>{o.title}</Text>
                            <Badge label={o.status} tone={STATUS_TONE[o.status]} />
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
