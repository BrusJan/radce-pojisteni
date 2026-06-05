export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
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
