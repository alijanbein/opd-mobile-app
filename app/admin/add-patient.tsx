import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/useTheme';
import { radius, spacing } from '../../theme/colors';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';
import { useSession } from '../../context/AuthContext';
import * as staffApi from '../../api/staff';
import type { PatientCreate } from '../../api/staff';

const EMPTY_FORM: PatientCreate = {
  name: '', age: 0, gender: '', dob: '', phone: '', mrn: '', email: '', address: '',
  bloodType: '', allergies: '', appointmentTime: '', appointmentDate: '', bodyArea: 'Knee', avatar: '#0369a1',
};

type Notice = {
  title: string;
  message: string;
  tone: 'info' | 'warning' | 'danger';
};

function Field({ label, value, onChangeText, keyboardType, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'; multiline?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline} placeholder={label} placeholderTextColor={colors.textMuted} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, minHeight: multiline ? 72 : undefined, textAlignVertical: multiline ? 'top' : 'center', color: colors.textPrimary, backgroundColor: colors.surface }} />
    </View>
  );
}

export default function AddPatientScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { staffUser, signOut } = useSession();
  const [form, setForm] = useState<PatientCreate>(EMPTY_FORM);
  const [bodyAreas, setBodyAreas] = useState<{ bodyArea: string; promName?: string; icon?: string }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [saving, setSaving] = useState(false);
  const [successPatient, setSuccessPatient] = useState<PatientCreate | null>(null);
  const [duplicateMrn, setDuplicateMrn] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    staffApi.getBodyAreas().then(setBodyAreas).catch(() => {});
  }, []);

  const update = (key: keyof PatientCreate, value: string) => setForm((current) => ({ ...current, [key]: key === 'age' ? Number(value) || 0 : value }));

  const applyQrData = (raw: string) => {
    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data.type && data.type !== 'hospital-patient' && data.type !== 'patient') throw new Error('Unsupported QR code');
      const allowed = ['age', 'gender', 'dob', 'phone', 'mrn', 'email', 'address', 'bloodType', 'allergies', 'appointmentTime', 'appointmentDate', 'bodyArea'] as const;
      setForm((current) => {
        const next = { ...current };
        for (const key of allowed) {
          if (data[key] !== undefined && data[key] !== null) (next as Record<string, string | number>)[key] = key === 'age' ? Number(data[key]) || 0 : String(data[key]);
        }
        return next;
      });
      setScanning(false);
      setNotice({ title: 'QR data loaded', message: 'Patient data was loaded. Confirm it before saving. The MRN identifies this patient.', tone: 'info' });
    } catch {
      setNotice({ title: 'Invalid QR code', message: 'Scan the hospital patient QR code containing JSON data.', tone: 'danger' });
    }
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setNotice({ title: 'Camera permission needed', message: 'Allow camera access to scan the hospital QR code.', tone: 'warning' });
        return;
      }
    }
    setScanning(true);
  };

  const save = async () => {
    if (!form.mrn.trim() || !form.dob.trim() || !form.bodyArea.trim() || !form.appointmentDate.trim()) {
      setNotice({ title: 'Missing details', message: 'MRN, date of birth, body area, and appointment date are required.', tone: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await staffApi.createPatient({ ...form, name: form.name?.trim() || undefined, mrn: form.mrn.trim() });
      setSuccessPatient({ ...form, mrn: form.mrn.trim(), name: form.name?.trim() || undefined });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setDuplicateMrn(form.mrn.trim());
      } else {
        setNotice({ title: 'Could not add patient', message: error?.response?.data?.detail || 'Please check the details and try again.', tone: 'danger' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Add Patient" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md }}>
        <Card style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>Staff admin</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{staffUser?.name} · {staffUser?.role}</Text>
            </View>
            <Pressable onPress={() => signOut()}><Ionicons name="log-out-outline" size={20} color={colors.danger} /></Pressable>
          </View>
        </Card>

        <Pressable onPress={startScan} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14 }}>
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800' }}>Scan hospital QR code</Text>
        </Pressable>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>The QR code must not contain the patient name. MRN is the required patient identifier; name is optional.</Text>

        <Card style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Patient details</Text>
          <Field label="Patient name (optional)" value={form.name || ''} onChangeText={(v) => update('name', v)} />
          <Field label="MRN / hospital ID" value={form.mrn} onChangeText={(v) => update('mrn', v)} />
          <Field label="Date of birth (YYYY-MM-DD)" value={form.dob} onChangeText={(v) => update('dob', v)} />
          <Field label="Age" value={String(form.age || '')} onChangeText={(v) => update('age', v)} keyboardType="numeric" />
          <Field label="Gender" value={form.gender} onChangeText={(v) => update('gender', v)} />
          <Field label="Phone" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />
          <Field label="Email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" />
          <Field label="Address" value={form.address} onChangeText={(v) => update('address', v)} multiline />
          <Field label="Blood type" value={form.bloodType} onChangeText={(v) => update('bloodType', v)} />
          <Field label="Allergies" value={form.allergies} onChangeText={(v) => update('allergies', v)} multiline />
          <Field label="Body area" value={form.bodyArea} onChangeText={(v) => update('bodyArea', v)} />
          {bodyAreas.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {bodyAreas.map((area) => <Pressable key={area.bodyArea} onPress={() => update('bodyArea', area.bodyArea)} style={{ paddingHorizontal: 11, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: form.bodyArea === area.bodyArea ? colors.primaryLight : colors.surface2, borderWidth: 1, borderColor: form.bodyArea === area.bodyArea ? colors.primary : colors.border }}><Text style={{ color: colors.textPrimary, fontSize: 12 }}>{area.icon} {area.bodyArea}</Text></Pressable>)}
          </ScrollView>}
          <Field label="Appointment date (YYYY-MM-DD)" value={form.appointmentDate} onChangeText={(v) => update('appointmentDate', v)} />
          <Field label="Appointment time" value={form.appointmentTime} onChangeText={(v) => update('appointmentTime', v)} />
        </Card>

        <Pressable onPress={save} disabled={saving} style={{ backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Add patient</Text>}
        </Pressable>
      </ScrollView>

      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => applyQrData(data)} />
          <Pressable onPress={() => setScanning(false)} style={{ position: 'absolute', top: 60, right: 20, padding: 10 }}><Ionicons name="close" size={30} color="#fff" /></Pressable>
          <View style={{ position: 'absolute', bottom: 50, left: 24, right: 24, padding: 14, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.65)' }}><Text style={{ color: '#fff', textAlign: 'center' }}>Point the camera at the hospital patient QR code</Text></View>
        </View>
      </Modal>

      <Modal visible={!!successPatient} transparent animationType="fade" onRequestClose={() => { setSuccessPatient(null); setForm(EMPTY_FORM); }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: 'rgba(7, 28, 46, 0.55)' }}>
          <View style={{ width: '100%', maxWidth: 390, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successLight }}>
              <Ionicons name="checkmark" size={38} color={colors.success} />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 21, fontWeight: '800', textAlign: 'center' }}>Patient added successfully</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, textAlign: 'center' }}>
              The patient record is now available in the hospital system.
            </Text>
            <View style={{ width: '100%', backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>MRN</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 12.5, fontWeight: '800' }}>{successPatient?.mrn}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Body area</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 12.5, fontWeight: '700' }}>{successPatient?.bodyArea}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => { setSuccessPatient(null); setForm(EMPTY_FORM); }}
              style={{ width: '100%', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13 }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Add another patient</Text>
            </Pressable>
            <Pressable onPress={() => { setSuccessPatient(null); setForm(EMPTY_FORM); }} hitSlop={8}>
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!duplicateMrn} transparent animationType="fade" onRequestClose={() => setDuplicateMrn(null)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: 'rgba(7, 28, 46, 0.55)' }}>
          <View style={{ width: '100%', maxWidth: 390, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.warningLight }}>
              <Ionicons name="information" size={38} color={colors.warning} />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 21, fontWeight: '800', textAlign: 'center' }}>Patient already added</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, textAlign: 'center' }}>
              This MRN already belongs to a patient record. No duplicate was created.
            </Text>
            <View style={{ width: '100%', backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Existing MRN</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 4 }}>{duplicateMrn}</Text>
            </View>
            <Pressable onPress={() => setDuplicateMrn(null)} style={{ width: '100%', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Review patient details</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
