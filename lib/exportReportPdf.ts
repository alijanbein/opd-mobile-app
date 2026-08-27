import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { SoapNote, VisitReport } from '../api/patient';

const SOAP_SECTIONS: { id: keyof SoapNote; label: string }[] = [
  { id: 'chiefComplaint', label: 'Chief Complaint' },
  { id: 'historyOfPresentIllness', label: 'History of Present Illness' },
  { id: 'pastMedicalHistory', label: 'Past Medical History' },
  { id: 'examination', label: 'Examination' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'plan', label: 'Plan' },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml(report: VisitReport, patientName: string) {
  const soapHtml = SOAP_SECTIONS
    .map((s) => {
      const value = report.soapNote?.[s.id];
      if (!value) return '';
      return `<div class="section"><div class="label">${s.label}</div><div class="text">${escapeHtml(value)}</div></div>`;
    })
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #0b1f2e; padding: 24px; }
          h1 { font-size: 20px; color: #075985; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #45596a; margin-bottom: 20px; }
          .summary { background: #e0f2fe; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 13.5px; line-height: 1.5; }
          .summary .label { font-size: 11px; font-weight: 700; color: #075985; text-transform: uppercase; margin-bottom: 6px; }
          .section { margin-bottom: 14px; }
          .label { font-size: 11px; font-weight: 700; color: #0369a1; text-transform: uppercase; margin-bottom: 4px; }
          .text { font-size: 13px; line-height: 1.5; }
          .diagnosis { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>Visit Report</h1>
        <div class="meta">${escapeHtml(patientName)} &middot; ${escapeHtml(report.providerName)} &middot; ${escapeHtml(report.date)}</div>
        <div class="diagnosis">${escapeHtml(report.diagnosis || 'No diagnosis recorded')}</div>
        ${report.patientSummary ? `<div class="summary"><div class="label">Summary</div>${escapeHtml(report.patientSummary)}</div>` : ''}
        ${soapHtml}
      </body>
    </html>
  `;
}

export async function exportReportPdf(report: VisitReport, patientName: string) {
  const html = buildHtml(report, patientName);

  if (Platform.OS === 'web') {
    // expo-print's web implementation ignores the html/uri options entirely
    // and just calls window.print() on whatever's currently on screen — no
    // use for printing arbitrary content. Open the report HTML in its own
    // tab instead and print that tab directly; the browser's own "Save as
    // PDF" destination is the actual export path here.
    const printWindow = window.open('', '_blank');
    if (!printWindow) return; // popup blocked — nothing more we can do without user action
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
  }
}
