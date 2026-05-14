export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: 'ADVISOR' | 'CLIENT';
}

export interface Client {
  id: number;
  advisorId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  notes: string | null;
  username: string | null;
  password: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string | null;
  address: string;
  notes: string;
  username: string;
  password: string;
}

export interface AdvisorFile {
  id: number;
  advisorId: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  isPublic: boolean;
  createdAt: string;
}
