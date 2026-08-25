// Mirrors backend/schemas.py shapes so swapping mock data for real API calls
// later is a straight drop-in — see data/mockData.ts for sample values and
// api/client.ts (not built yet — patient login/auth doesn't exist on the
// backend yet, see README) for where real fetches will slot in.

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  bodyArea: string;
  avatarColor: string;
  phone: string;
};

export type Appointment = {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;        // "09:30"
  type: 'Follow-Up' | 'Pre-Visit' | 'Initial';
  physician: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};

export type PromStatus = 'pending' | 'completed' | 'overdue' | 'not_due';

export type PromTask = {
  id: string;
  promName: string;      // "KOOS, JR"
  bodyArea: string;
  dueDate: string;
  status: PromStatus;
  accessToken?: string;  // when present, opens the same public fill flow the web app uses
};

export type OrderKind = 'diagnostic' | 'treatment';
export type OrderStatus = 'pending' | 'active' | 'completed' | 'scheduled';

export type DoctorOrder = {
  id: string;
  kind: OrderKind;
  title: string;          // "MRI", "Physiotherapy", "Diclofenac 75mg"
  icon: string;            // emoji, matches web app's DIAGNOSTIC_TESTS/TREATMENT_OPTIONS icons
  detail?: string;
  date: string;
  status: OrderStatus;
  followUpDate?: string | null;
};

export type JourneyVisit = {
  id: string;
  date: string;
  type: 'Evaluation' | 'Pre-Visit Assessment' | 'Follow-Up Call';
  diagnosis?: string;
  physician?: string;
  promScore?: number | null;   // 0-100, null if not scored
  orders: DoctorOrder[];
};

export type TrendPoint = {
  label: string;         // "Baseline", "6 Weeks", ...
  score: number | null;  // null = Missing, never fabricated — matches backend/routers/prom_trend.py
};

export type TrendEvent = {
  type: 'surgery' | 'injection' | 'physiotherapy' | 'new_injury';
  label: string;
  date: string;
};
