import { useState } from 'react';
import { ScrollView, Text, View, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';
import { useSession } from '../../context/AuthContext';

function Row({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}
    >
      <Ionicons name={icon} size={18} color={colors.textMuted} style={{ width: 22 }} />
      <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary, fontWeight: '600' }}>{label}</Text>
      {value ? <Text style={{ fontSize: 13, color: colors.textMuted }}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { patient, signOut } = useSession();
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (!patient) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader title="Profile" />

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
          {/* Identity card */}
          <Card style={{ alignItems: 'center', gap: 6 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
                {patient.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: 4 }}>{patient.name}</Text>
            <Text style={{ fontSize: 12.5, color: colors.textMuted }}>
              {patient.mrn}{'age' in patient ? ` · ${patient.age} yrs · ${patient.gender}` : ''}
            </Text>
          </Card>

          {/* Account */}
          <Card style={{ paddingVertical: 4 }}>
            <Row icon="call-outline" label="Phone" value={patient.phone} onPress={() => {}} />
            <Divider />
            <Row icon="person-outline" label="Personal Details" onPress={() => {}} />
            <Divider />
            <Row icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => {}} />
          </Card>

          {/* Preferences */}
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
              Preferences
            </Text>
            <Card style={{ paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="notifications-outline" size={18} color={colors.textMuted} style={{ width: 22 }} />
                <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary, fontWeight: '600' }}>Notifications</Text>
                <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.primary, false: colors.border }} />
              </View>
              <Divider />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="alarm-outline" size={18} color={colors.textMuted} style={{ width: 22 }} />
                <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary, fontWeight: '600' }}>Appointment Reminders</Text>
                <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.primary, false: colors.border }} />
              </View>
              <Divider />
              <Row icon="language-outline" label="Language" value="English" onPress={() => {}} />
              <Divider />
              <Row icon="moon-outline" label="Appearance" value="Automatic" onPress={() => {}} />
            </Card>
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
              Support
            </Text>
            <Card style={{ paddingVertical: 4 }}>
              <Row icon="help-circle-outline" label="Help & FAQ" onPress={() => {}} />
              <Divider />
              <Row icon="call-outline" label="Contact the Clinic" onPress={() => {}} />
            </Card>
          </View>

          <Pressable
            onPress={handleLogout}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 13, borderRadius: radius.md, backgroundColor: colors.dangerLight,
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
