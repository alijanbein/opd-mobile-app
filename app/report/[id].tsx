import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import Card from '../../components/Card';
import { useSession } from '../../context/AuthContext';
import { getVisitReport, documentFileUrl } from '../../api/patient';
import type { SoapNote, VisitReport, VisitReportDocument } from '../../api/patient';
import { downloadDocument } from '../../lib/downloadDocument';
import { exportReportPdf } from '../../lib/exportReportPdf';

const SOAP_SECTIONS: { id: keyof SoapNote; label: string }[] = [
  { id: 'chiefComplaint', label: 'Chief Complaint' },
  { id: 'historyOfPresentIllness', label: 'History of Present Illness' },
  { id: 'pastMedicalHistory', label: 'Past Medical History' },
  { id: 'examination', label: 'Examination' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'plan', label: 'Plan' },
];

const REPORT_TYPE_LABEL: Record<VisitReport['reportType'], string> = {
  physician: 'Physician Evaluation',
  surgery: 'Surgery Evaluation',
};

function DocumentRow({ document }: { document: VisitReportDocument }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { token } = useSession();
  const [busy, setBusy] = useState(false);
  const isImage = document.contentType.startsWith('image/');

  const open = async () => {
    if (isImage) {
      router.push(`/document/${document.id}?name=${encodeURIComponent(document.originalName)}`);
      return;
    }
    setBusy(true);
    try {
      const file = await downloadDocument(documentFileUrl(document.id), token, document.originalName);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable onPress={open} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}>
      <Ionicons name={isImage ? 'image-outline' : 'document-text-outline'} size={20} color={colors.primary} />
      <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary, fontWeight: '600' }} numberOfLines={1}>
        {document.originalName}
      </Text>
      {busy ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="download-outline" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

export default function ReportDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { patient } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<VisitReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getVisitReport(id)
      .then(setReport)
      .catch(() => setError('This report could not be loaded.'));
  }, [id]);

  const onExport = async () => {
    if (!report || exporting) return;
    setExporting(true);
    try {
      await exportReportPdf(report, patient?.name ?? 'Patient');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
        backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>Visit Report</Text>
        </View>
        {report ? (
          <Pressable onPress={onExport} disabled={exporting} hitSlop={10}>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="share-outline" size={22} color={colors.primary} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </View>
      ) : !report ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl }}>
          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              {REPORT_TYPE_LABEL[report.reportType]}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 4 }}>
              {report.diagnosis || 'No diagnosis recorded'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{report.providerName}</Text>
              <Text style={{ color: colors.textMuted }}>·</Text>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{report.date}</Text>
            </View>
          </Card>

          {report.patientSummary ? (
            <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primarySoft }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', marginBottom: 6 }}>
                Summary
              </Text>
              <Text style={{ fontSize: 13.5, color: colors.textPrimary, lineHeight: 20 }}>{report.patientSummary}</Text>
            </Card>
          ) : null}

          {SOAP_SECTIONS.map((section) => {
            const value = report.soapNote?.[section.id];
            if (!value) return null;
            return (
              <Card key={section.id}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.primary, marginBottom: 6 }}>{section.label}</Text>
                <Text style={{ fontSize: 13.5, color: colors.textPrimary, lineHeight: 20 }}>{value}</Text>
              </Card>
            );
          })}

          {report.documents.length > 0 && (
            <Card style={{ paddingVertical: 6 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 }}>Attached Documents</Text>
              {report.documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}
