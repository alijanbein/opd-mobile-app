import api from './client';

export type StaffUser = {
  email: string;
  name?: string;
  role: string;
};

export type PatientCreate = {
  name?: string;
  age: number;
  gender: string;
  dob: string;
  phone: string;
  mrn: string;
  email: string;
  address: string;
  bloodType: string;
  allergies: string;
  appointmentTime: string;
  appointmentDate: string;
  bodyArea: string;
  avatar: string;
};

export async function login(email: string, password: string) {
  const res = await api.post<{ access_token: string; user: StaffUser }>('/api/auth/login', { email, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get<StaffUser>('/api/auth/me');
  return res.data;
}

export async function createPatient(patient: PatientCreate) {
  const res = await api.post('/api/patients', patient);
  return res.data;
}

export async function getBodyAreas() {
  const res = await api.get<{ bodyAreas: { bodyArea: string; promName?: string; icon?: string }[] }>('/api/body-areas');
  return res.data.bodyAreas;
}
