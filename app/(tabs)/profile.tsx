import { useState } from 'react';
import { ScrollView, Text, View, Pressable, Switch, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';
import { useSession } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../i18n';

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

const LANGUAGE_OPTIONS: { code: Language; nativeLabel: string }[] = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'ar', nativeLabel: 'العربية' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { patient, signOut, updateProfile } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const currentLanguageLabel = LANGUAGE_OPTIONS.find((o) => o.code === language)?.nativeLabel ?? 'English';

  const handleLogout = () => {
    Alert.alert(t('profile.logout.title'), t('profile.logout.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout.title'), style: 'destructive', onPress: () => signOut() },
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
      Alert.alert(t('profile.missingDetails.title'), t('profile.missingDetails.message'));
      return;
    }
    setSaving(true);
    try {
      await updateProfile(email.trim(), address.trim());
      setEditVisible(false);
      Alert.alert(t('profile.saveSuccess.title'), t('profile.saveSuccess.message'));
    } catch (error: any) {
      Alert.alert(t('profile.saveError.title'), error?.response?.data?.detail || t('profile.saveError.fallback'));
    } finally {
      setSaving(false);
    }
  };

  if (!patient) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader title={t('profile.header.title')} />

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
            <Row icon="call-outline" label={t('profile.phone.label')} value={patient.phone} onPress={() => Alert.alert(t('profile.phone.alertTitle'), t('profile.phone.alertMessage'))} />
            <Divider />
            <Row icon="person-outline" label={t('profile.personalDetails.label')} onPress={openEditProfile} />
            <Divider />
            <Row icon="shield-checkmark-outline" label={t('profile.privacy.label')} onPress={() => Alert.alert(t('profile.privacy.alertTitle'), t('profile.privacy.alertMessage'))} />
          </Card>

          {/* Preferences */}
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
              {t('profile.preferences.sectionTitle')}
            </Text>
            <Card style={{ paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="notifications-outline" size={18} color={colors.textMuted} style={{ width: 22 }} />
                <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary, fontWeight: '600' }}>{t('profile.preferences.notifications')}</Text>
                <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.primary, false: colors.border }} />
              </View>
              <Divider />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="alarm-outline" size={18} color={colors.textMuted} style={{ width: 22 }} />
                <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary, fontWeight: '600' }}>{t('profile.preferences.appointmentReminders')}</Text>
                <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.primary, false: colors.border }} />
              </View>
              <Divider />
              <Row icon="language-outline" label={t('common.language')} value={currentLanguageLabel} onPress={() => setLanguageVisible(true)} />
              <Divider />
              <Row icon="moon-outline" label={t('profile.preferences.appearance')} value={t('profile.preferences.appearanceValue')} onPress={() => Alert.alert(t('profile.preferences.appearanceAlertTitle'), t('profile.preferences.appearanceAlertMessage'))} />
            </Card>
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
              {t('profile.support.sectionTitle')}
            </Text>
            <Card style={{ paddingVertical: 4 }}>
              <Row icon="help-circle-outline" label={t('profile.support.helpFaq')} onPress={() => Alert.alert(t('profile.support.helpFaq'), t('profile.support.helpFaqAlertMessage'))} />
              <Divider />
              <Row icon="call-outline" label={t('profile.support.contactClinic')} onPress={() => Alert.alert(t('profile.support.contactClinic'), t('profile.support.contactClinicAlertMessage'))} />
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
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>{t('profile.logout.title')}</Text>
          </Pressable>
        </View>

        <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <View style={{ backgroundColor: colors.surface, padding: spacing.xl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, gap: spacing.md }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{t('profile.personalDetails.label')}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('profile.personalDetails.subtitle')}</Text>
              <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('profile.personalDetails.emailPlaceholder')} placeholderTextColor={colors.textMuted} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, color: colors.textPrimary, backgroundColor: colors.bg }} />
              <TextInput value={address} onChangeText={setAddress} placeholder={t('profile.personalDetails.addressPlaceholder')} placeholderTextColor={colors.textMuted} multiline style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, color: colors.textPrimary, backgroundColor: colors.bg, minHeight: 80, textAlignVertical: 'top' }} />
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Pressable onPress={() => setEditVisible(false)} disabled={saving} style={{ flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable onPress={saveProfile} disabled={saving} style={{ flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.save')}</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={languageVisible} transparent animationType="fade" onRequestClose={() => setLanguageVisible(false)}>
          <Pressable
            onPress={() => setLanguageVisible(false)}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: spacing.xl }}
          >
            <View style={{ width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 }}>{t('common.language')}</Text>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.code}
                  onPress={() => { setLanguage(opt.code); setLanguageVisible(false); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 13, paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{opt.nativeLabel}</Text>
                  {language === opt.code && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}
