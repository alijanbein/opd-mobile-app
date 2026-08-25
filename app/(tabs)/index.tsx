import { ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ScreenHeader from '../../components/ScreenHeader';
import { mockActiveOrders, mockNextAppointment, mockPatient, mockPromTask } from '../../data/mockData';

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const days = daysUntil(mockNextAppointment.date);
  const activeOrders = mockActiveOrders.filter((o) => o.status === 'active');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader title={`Hi, ${mockPatient.name.split(' ')[0]}`} subtitle="Here's where things stand with your knee care" />

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
          {/* Next Appointment */}
          <Card style={{ padding: 0, overflow: 'hidden', borderColor: colors.primary }}>
            <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>NEXT APPOINTMENT</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                  {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                </Text>
              </View>
            </View>
            <View style={{ padding: spacing.lg, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                  {new Date(mockNextAppointment.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })} · {mockNextAppointment.time}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="person-outline" size={16} color={colors.textMuted} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>{mockNextAppointment.physician} · {mockNextAppointment.type}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{mockNextAppointment.location}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Pressable style={{ flex: 1, backgroundColor: colors.primaryLight, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center' }}>
                  <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 13 }}>Get Directions</Text>
                </Pressable>
                <Pressable style={{ flex: 1, backgroundColor: colors.surface2, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 13 }}>Reschedule</Text>
                </Pressable>
              </View>
            </View>
          </Card>

          {/* PROM reminder */}
          {mockPromTask && mockPromTask.status !== 'completed' && (
            <Card style={{ borderColor: colors.warning, backgroundColor: colors.warningLight, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="clipboard-outline" size={20} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: 13.5 }}>Check-in due: {mockPromTask.promName}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>A few quick questions about your {mockPromTask.bodyArea.toLowerCase()} — due {mockPromTask.dueDate}</Text>
              </View>
              <Pressable style={{ backgroundColor: colors.warning, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>Start</Text>
              </Pressable>
            </Card>
          )}

          {/* Quick stats */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="body-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>Treating</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>{mockPatient.bodyArea}</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.success} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Active Care</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{activeOrders.length} item{activeOrders.length === 1 ? '' : 's'}</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Ionicons name="trending-up-outline" size={20} color={colors.info} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Progress</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>Improving</Text>
            </Card>
          </View>

          {/* Current care plan */}
          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 }}>Your Care Plan</Text>
            <View style={{ gap: 10 }}>
              {activeOrders.map((o) => (
                <Card key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md }}>
                  <Text style={{ fontSize: 22 }}>{o.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: 13.5 }}>{o.title}</Text>
                    {o.detail ? <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{o.detail}</Text> : null}
                  </View>
                  <Badge label={o.kind === 'treatment' ? 'Treatment' : 'Test'} tone={o.kind === 'treatment' ? 'success' : 'primary'} />
                </Card>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
