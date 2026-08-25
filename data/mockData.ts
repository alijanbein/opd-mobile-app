import type { Appointment, DoctorOrder, JourneyVisit, Patient, PromTask, TrendEvent, TrendPoint } from '../types';

// Sample data shaped exactly like what the FastAPI backend already returns
// for a patient's evaluations/diagnostics/treatments/assessments — swap for
// real fetches once patient login exists on the backend (see README).

export const mockPatient: Patient = {
  id: 'p001',
  name: 'Ahmad Al-Rashid',
  age: 52,
  gender: 'Male',
  mrn: 'MRN-001234',
  bodyArea: 'Knee',
  avatarColor: '#0369a1',
  phone: '+966 50 123 4567',
};

export const mockNextAppointment: Appointment = {
  id: 'apt-1',
  date: '2026-08-22',
  time: '10:30',
  type: 'Follow-Up',
  physician: 'Dr. Sarah Al-Mansoori',
  location: 'Al-Rasoul Al-Aazam Hospital — Orthopedic OPD, Room 4',
  status: 'upcoming',
};

export const mockPromTask: PromTask | null = {
  id: 'pt-1',
  promName: 'KOOS, JR',
  bodyArea: 'Knee',
  dueDate: '2026-08-20',
  status: 'pending',
};

export const mockActiveOrders: DoctorOrder[] = [
  { id: 'o1', kind: 'treatment', title: 'Physiotherapy', icon: '🏃', detail: '6 weeks, 2x/week', date: '2026-07-10', status: 'active', followUpDate: '2026-08-22' },
  { id: 'o2', kind: 'diagnostic', title: 'MRI', icon: '🩻', detail: 'Right knee, no contrast', date: '2026-07-10', status: 'completed' },
  { id: 'o3', kind: 'treatment', title: 'Diclofenac 75mg', icon: '💊', detail: '1 tab twice daily, as needed for pain', date: '2026-07-10', status: 'active' },
];

export const mockJourney: JourneyVisit[] = [
  {
    id: 'v3', date: '2026-07-10', type: 'Evaluation', diagnosis: 'Osteoarthritis Grade 2, Right Knee',
    physician: 'Dr. Sarah Al-Mansoori', promScore: 58,
    orders: [mockActiveOrders[0], mockActiveOrders[1], mockActiveOrders[2]],
  },
  {
    id: 'v2', date: '2026-06-15', type: 'Pre-Visit Assessment', promScore: 44, orders: [],
  },
  {
    id: 'v1', date: '2026-05-02', type: 'Evaluation', diagnosis: 'Initial consult — right knee pain',
    physician: 'Dr. Sarah Al-Mansoori', promScore: 40, orders: [],
  },
];

export const mockTrendPoints: TrendPoint[] = [
  { label: 'Baseline', score: 40 },
  { label: '6 Weeks', score: 44 },
  { label: '3 Months', score: 58 },
  { label: '6 Months', score: null },
  { label: '12 Months', score: null },
  { label: '2 Years', score: null },
  { label: '5 Years', score: null },
];

export const mockTrendEvents: TrendEvent[] = [
  { type: 'physiotherapy', label: 'Start Physiotherapy', date: '2026-07-10' },
];
