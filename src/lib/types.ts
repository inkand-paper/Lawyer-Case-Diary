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
  _count?: {
    cases: number;
  };
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
  hearings?: Hearing[];
}

export interface Hearing {
  id: string;
  caseId: string;
  hearingDate: string | Date;
  nextDate?: string | Date | null;
  notes?: string | null;
  // NOTE: Hearing has no status field in the schema.
  // If you need hearing statuses, add it to the Prisma schema first.
  case?: Case;
}

export interface Chamber {
  id: string;
  name: string;
  ownerId: string;
  members?: User[];
  invites?: Invitation[];
  cases?: Case[];
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: "PENDING" | "ACCEPTED" | "DECLINED"; // matches schema: PENDING, ACCEPTED, DECLINED
  chamberId: string;
  expiresAt?: Date | null;
  chamber?: Chamber;
}
