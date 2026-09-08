import { useState } from 'react';
import { ScrollView, Text, View, Pressable, Switch, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
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
  const { patient, signOut, updateProfile } = useSession();
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const openEditProfile = () => {
    if (!patient || !('email' in patient)) return;
    setEmail(patient.email);
    setAddress(patient.address);
    setEditVisible(true);
  };

  const saveProfile = async () => {
    if (!email.trim() || !address.trim()) {
      Alert.alert('Missing details', 'Please enter both an email address and an address.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(email.trim(), address.trim());
      setEditVisible(false);
      Alert.alert('Profile updated', 'Your contact details have been saved.');
    } catch (error: any) {
      Alert.alert('Could not save', error?.response?.data?.detail || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!patient) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader title="Profile" />

        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.lg }}>
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
            <Row icon="call-outline" label="Phone" value={patient.phone} onPress={() => Alert.alert('Phone number', 'To change your phone number, please contact the clinic.')} />
            <Divider />
            <Row icon="person-outline" label="Personal Details" onPress={openEditProfile} />
            <Divider />
            <Row icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => Alert.alert('Privacy & Security', 'Your account is protected by one-time phone verification. Contact the clinic if you need help with access.')} />
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
              <Row icon="language-outline" label="Language" value="English" onPress={() => Alert.alert('Language', 'English is currently the available language.')} />
              <Divider />
              <Row icon="moon-outline" label="Appearance" value="Automatic" onPress={() => Alert.alert('Appearance', 'The app follows your phone\'s light or dark mode setting.')} />
            </Card>
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
              Support
            </Text>
            <Card style={{ paddingVertical: 4 }}>
              <Row icon="help-circle-outline" label="Help & FAQ" onPress={() => Alert.alert('Help & FAQ', 'For help with appointments, forms, or your account, contact the clinic.')} />
              <Divider />
              <Row icon="call-outline" label="Contact the Clinic" onPress={() => Alert.alert('Contact the Clinic', 'Please call the clinic using the phone number provided by your care team.')} />
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

        <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <View style={{ backgroundColor: colors.surface, padding: spacing.xl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, gap: spacing.md }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Personal Details</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Update the contact details your care team uses.</Text>
              <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor={colors.textMuted} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, color: colors.textPrimary, backgroundColor: colors.bg }} />
              <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={colors.textMuted} multiline style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, color: colors.textPrimary, backgroundColor: colors.bg, minHeight: 80, textAlignVertical: 'top' }} />
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Pressable onPress={() => setEditVisible(false)} disabled={saving} style={{ flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveProfile} disabled={saving} style={{ flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}
