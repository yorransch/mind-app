export type UserRole = 'youth' | 'professional';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isVerified: boolean; // Added for email confirmation
  assignedProfessionalId?: string;
  points?: number;
}

export interface CheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  mood: 'sad' | 'neutral' | 'happy' | 'very-happy';
  anxiety: number; // 1-10
  energy: number; // 1-10
  sleptWell: boolean;
  notes: string;
}

export interface Resource {
  id: string;
  name: string;
  nameEu: string;
  description: string;
  descriptionEu: string;
  category: 'health' | 'association' | 'emergency' | 'event';
  phone: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'anxiety' | 'energy' | 'trend';
  severity: 'yellow' | 'red';
  resolved: boolean;
}
