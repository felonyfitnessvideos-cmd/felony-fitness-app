// src/types/index.ts

/**
 * Represents the comprehensive data structure for a client object
 * as used in the trainer dashboard and its child components.
 */
export interface Client {
  relationshipId: string;
  clientId: string; // The user's UUID
  name: string;
  email: string | null;
  phone: string | null;
  joinDate?: string;
  notes?: string | null;
  status?: string;
  dateOfBirth?: string | null;
  fitnessGoals?: string;
  medicalConditions?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  height?: number | string | null;
  weight?: number | string | null;
  bodyFatPercentage?: number | string | null;
  restingHeartRate?: number | string | null;
  bloodPressure?: string | null;
  
  // Properties from user_profiles that might be on the object
  first_name?: string;
  last_name?: string;
  
  // Deprecated or alternate properties to handle gracefully
  full_name?: string;
  id?: string;
}
