// TypeScript types for FindSight AI

export interface MissingPerson {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  lastSeenLocation: string;
  photoUrl: string;
  faceEncoding: number[];
  status: 'searching' | 'found' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Detection {
  _id: string;
  personId: string | MissingPerson;
  confidenceScore: number;
  capturedImage: string;
  timestamp: string;
  verified: boolean;
  cameraSource?: string;
  createdAt: string;
}

export interface MatchResult {
  matched: boolean;
  confidence: number;
  personId?: string;
  personName?: string;
  capturedImage?: string;
}

export interface FaceEncoding {
  encoding: number[];
  success: boolean;
  error?: string;
}

export interface DashboardStats {
  totalPersons: number;
  totalDetections: number;
  activeSearches: number;
  recentDetections: Detection[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RegisterFormData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  lastSeenLocation: string;
  photo: File | null;
}
