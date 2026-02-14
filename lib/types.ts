export interface Respondent {
  id: number;
  timestamp: string;
  fullName: string;
  email: string;
  address: string;
  phone: string;
  gender: string;
  maritalStatus: string;
  birthday: string;
  employmentStatus: string;
  education: string;
  courseOfStudy: string;
  branch: string;
}

export interface DashboardStats {
  total: number;
  genderBreakdown: Record<string, number>;
  employmentBreakdown: Record<string, number>;
  educationBreakdown: Record<string, number>;
  maritalBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  monthlyRegistrations: Record<string, number>;
  topBranches: Array<{ name: string; count: number; percentage: number }>;
  courseCategories: Record<string, number>;
}

export interface FilterState {
  gender: string;
  employment: string;
  education: string;
  branch: string;
  marital: string;
  search: string;
}

export type ExportFormat = "pdf" | "excel" | "csv";
