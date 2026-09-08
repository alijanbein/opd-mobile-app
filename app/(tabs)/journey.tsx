import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ScreenHeader from '../../components/ScreenHeader';
import { getPromTrend, getVisitReports } from '../../api/patient';
import type { PromTrend, VisitReport } from '../../api/patient';

function TrendMini({ trend }: { trend: PromTrend | null }) {
  const { colors } = useTheme();

  if (!trend) {
    return (
      <Card style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <ActivityIndicator color={colors.primary} />
      </Card>
    );
  }

  const known = trend.points.filter((p) => p.score !== null);

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>
          Your Progress{trend.promName ? ` — ${trend.promName}` : ''}
        </Text>
        {trend.improvement != null && (
          <Badge
            label={`${trend.improvement >= 0 ? '▲ +' : '▼ '}${trend.improvement} from baseline`}
            tone="success"
          />
        )}
      </View>
      {known.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 12.5 }}>
          No check-ins scored yet — this fills in once a PROM questionnaire is completed.
        </Text>
      ) : (
        <>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6 }}>
            Missing check-ins show as gaps — we never invent a score.
          </Text>
          {trend.events.map((ev) => (
            <Text key={`${ev.type}-${ev.date}`} style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>
              🔹 {ev.label} — {ev.date}
            </Text>
          ))}
        </>
      )}
    </Card>
  );
}

const REPORT_TYPE_LABEL: Record<VisitReport['reportType'], string> = {
  physician: 'Physician Evaluation',
  surgery: 'Surgery Evaluation',
};

export default function JourneyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [reports, setReports] = useState<VisitReport[] | null>(null);
  const [trend, setTrend] = useState<PromTrend | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [reportsData, trendData] = await Promise.all([getVisitReports(), getPromTrend()]);
      setReports(reportsData);
      setTrend(trendData);
      setError(null);
    } catch {
      setError('Could not load your visit history.');
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <ScreenHeader title="Your Journey" subtitle="Visits, check-ins, and what your doctor has asked for" />

        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.lg }}>
          <TrendMini trend={trend} />

          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 }}>Visit Reports</Text>

            {reports === null && !error ? (
              <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : error ? (
              <Card style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
              </Card>
            ) : reports!.length === 0 ? (
              <Card style={{ alignItems: 'center', gap: 4 }}>
                <Ionicons name="document-text-outline" size={24} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>No visit reports yet</Text>
              </Card>
            ) : (
              <View>
                {reports!.map((visit, i) => (
                  <View key={visit.id} style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ alignItems: 'center', width: 20 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 }} />
                      {i < reports!.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 }} />}
                    </View>
                    <Pressable onPress={() => router.push(`/report/${visit.id}`)} style={{ flex: 1, marginBottom: spacing.md }}>
                      <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>{visit.date}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 2 }}>
                              {REPORT_TYPE_LABEL[visit.reportType]}
                            </Text>
                            {visit.diagnosis && <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 3 }}>{visit.diagnosis}</Text>}
                            <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>{visit.providerName}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </View>

                        {visit.documents.length > 0 && (
                          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                            <Ionicons name="attach-outline" size={16} color={colors.primary} />
                            <Text style={{ fontSize: 12.5, color: colors.textPrimary, fontWeight: '600' }}>
                              {visit.documents.length} attached document{visit.documents.length === 1 ? '' : 's'}
                            </Text>
                          </View>
                        )}
                      </Card>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
