/**
 * Judicial System Type Definitions
 * Centrally managed interfaces for type-safe law firm operations.
 */

export type UserRole = "ADMIN" | "LAWYER" | "MEMBER";
export type UserPlan = "FREE" | "ESSENTIAL" | "EXECUTIVE" | "ULTIMATE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  chamberId?: string | null;
  emailVerified: boolean;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  userId: string;
  chamberId?: string | null;
  _count?: {
    cases: number;
  };
}

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  courtName: string;
  judgeName?: string | null;
  status: "ACTIVE" | "CLOSED";
  description?: string | null;
  clientId: string;
  userId: string;
  chamberId?: string | null;
  client?: Client;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Hearing {
  id: string;
  caseId: string;
  hearingDate: string | Date;
  nextDate?: string | Date | null;
  notes?: string | null;
  status: "PENDING" | "COMPLETED" | "ADJOURNED";
  case?: Case;
}

export interface Chamber {
  id: string;
  name: string;
  ownerId: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  chamberId: string;
}
