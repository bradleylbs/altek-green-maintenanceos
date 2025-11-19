
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  WORK_ORDERS = 'WORK_ORDERS',
  SCANNER = 'SCANNER',
  ASSISTANT = 'ASSISTANT',
  ROI = 'ROI'
}

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  siteId?: string;
}

export type WorkType = 'Scheduled' | 'Ad-hoc';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Flagged';

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  type: WorkType;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
  dueDate: string;
  location: string;
  checklist?: ChecklistItem[];
}

export interface Asset {
  id: string; // This is the QR payload
  name: string;
  category: string;
  siteId: string;
  lastMaintenance: string;
  status: 'Operational' | 'Down' | 'Maintenance Required';
}

export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface MaintenanceReport {
  summary: string;
  criticalIssues: string[];
  efficiencyScore: number;
  recommendations: string;
}

export interface ROIData {
  yearlySavings: number;
  monthlySavings: number;
  paybackPeriodMonths: number;
  co2Saved: number;
  advice: string;
}
