export interface AdminPlan {
  id: number;
  name: string;
  description: string;
  monthlyOcrLimit: number;
  monthlySttLimit: number;
  monthlyPrice: number;
  priceCurrency: string;
  isActive: boolean;
  createdOn: string;
  updatedOn: string;
}

export interface CreateAdminPlanRequest {
  name: string;
  description: string;
  monthlyOcrLimit: number;
  monthlySttLimit: number;
  monthlyPrice: number;
  priceCurrency: string;
  isActive: boolean;
}

export interface UpdateAdminPlanRequest {
  id: number;
  name: string;
  description: string;
  monthlyOcrLimit: number;
  monthlySttLimit: number;
  monthlyPrice: number;
  priceCurrency: string;
  isActive: boolean;
}

export interface UserPlanAssignmentRequest {
  email: string;
  planId: number;
}

export interface AdminUserUsage {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: number;
  subscriptionPlanId: number;
  subscriptionPlanName: string;
  ocrRequestsThisMonth: number;
  sttRequestsThisMonth: number;
  lastUsageActivityDate: string;
}

export interface AdminPlanUsageBreakdown {
  planId: number;
  planName: string;
  userCount: number;
  totalOcrRequests: number;
  totalSttRequests: number;
}

export interface AdminUsageSummary {
  totalUsers: number;
  activePlans: number;
  totalOcrRequestsThisMonth: number;
  totalSttRequestsThisMonth: number;
  planBreakdown: AdminPlanUsageBreakdown[];
}
