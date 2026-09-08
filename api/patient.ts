import api from './client';

// Mirrors backend/schemas.py's patient-facing response models
// (PatientRequestOtpResponse, PatientLoginResponse, PatientProfileOut,
// VisitReportOut, PatientNotificationOut — see routers/patient_auth.py and
// routers/patient_self.py).

export type AuthPatient = {
  id: string;
  name: string;
  mrn: string;
  bodyArea: string;
  phone: string;
};

export type PatientProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  bodyArea: string;
  phone: string;
  email: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
};

export type VisitReportDocument = {
  id: string;
  originalName: string;
  contentType: string;
};

export type SoapNote = {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  examination?: string;
  assessment?: string;
  plan?: string;
};

export type VisitReport = {
  id: string;
  reportType: 'physician' | 'surgery';
  date: string;
  providerName: string;
  diagnosis?: string | null;
  soapNote?: SoapNote | null;
  patientSummary?: string | null;
  documents: VisitReportDocument[];
};

export type PatientNotification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  relatedType?: string | null;
  relatedId?: string | null;
  isRead: boolean;
  createdAt: string;
};

export type PatientAppointment = {
  date: string;
  time: string;
  physicianName?: string | null;
};

export type ChatMessage = {
  id: string;
  senderType: 'patient' | 'staff';
  senderName?: string | null;
  text: string;
  createdAt: string;
};

export type ActiveCareItem = {
  id: string;
  kind: 'treatment' | 'diagnostic';
  title: string;
  detail?: string | null;
  date: string;
  status: string;
  followUpDate?: string | null;
};

export type PromStatus = {
  id: string;
  promName?: string | null;
  bodyArea: string;
  status: 'sent_pending' | 'assigned_to_clerk' | 'overdue' | 'deferred';
  completionMethod: 'self_completion' | 'clerk_assisted' | 'physician_assisted' | 'deferred';
  assignedAt?: string | null;
  accessToken?: string | null;
};

export type PromTrendPoint = {
  label: string;
  dayOffset: number;
  date?: string | null;
  score: number | null;
};

export type PromTrendEvent = {
  type: 'surgery' | 'injection' | 'physiotherapy' | 'new_injury';
  label: string;
  date: string;
  dayOffset: number;
};

export type PromTrend = {
  promName?: string | null;
  scoreDirection: 'higher_better' | 'lower_better';
  baselineDate?: string | null;
  points: PromTrendPoint[];
  events: PromTrendEvent[];
  improvement?: number | null;
};

export async function requestOtp(phone: string) {
  const res = await api.post<{ message: string; phone: string; devOtp?: string }>(
    '/api/patient/auth/request-otp',
    { phone }
  );
  return res.data;
}

export async function verifyOtp(phone: string, code: string) {
  const res = await api.post<{ access_token: string; token_type: string; patient: AuthPatient }>(
    '/api/patient/auth/verify-otp',
    { phone, code }
  );
  return res.data;
}

export async function getMe() {
  const res = await api.get<PatientProfile>('/api/patient/me');
  return res.data;
}

export async function updateMe(email: string, address: string) {
  const res = await api.patch<PatientProfile>('/api/patient/me', { email, address });
  return res.data;
}

export async function getVisitReports() {
  const res = await api.get<VisitReport[]>('/api/patient/visit-reports');
  return res.data;
}

export async function getVisitReport(id: string) {
  const res = await api.get<VisitReport>(`/api/patient/visit-reports/${id}`);
  return res.data;
}

export async function getNotifications() {
  const res = await api.get<PatientNotification[]>('/api/patient/notifications');
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await api.patch<PatientNotification>(`/api/patient/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  await api.patch('/api/patient/notifications/read-all');
}

export function documentFileUrl(documentId: string) {
  return `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/patient/documents/${documentId}/file`;
}

export async function getAppointment() {
  const res = await api.get<PatientAppointment>('/api/patient/appointment');
  return res.data;
}

export async function getActiveCare() {
  const res = await api.get<ActiveCareItem[]>('/api/patient/active-care');
  return res.data;
}

export async function getPromStatus() {
  const res = await api.get<PromStatus | null>('/api/patient/prom-status');
  return res.data;
}

export async function getPromTrend() {
  const res = await api.get<PromTrend>('/api/patient/prom-trend');
  return res.data;
}

export async function getMessages() {
  const res = await api.get<ChatMessage[]>('/api/patient/messages');
  return res.data;
}

export async function sendMessage(text: string) {
  const res = await api.post<ChatMessage>('/api/patient/messages', { text });
  return res.data;
}
