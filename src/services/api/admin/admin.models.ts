export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: number;
  subscriptionPlanId: number;
  planName: string;
  lastLoginDate: string;
  lockoutEnabled: boolean;
  lockoutEnd: string | null;
  emailConfirmed: boolean;
  accessFailedCount: number;
  roles: string[];
}

export interface AdminUserDetails extends AdminUser {
  avatarUrl: string | null;
  createdAt: string;
  preferredCurrency: string;
}

export interface AdminAnnouncement {
  id: number;
  titleEn: string;
  titleTr: string;
  bodyEn: string;
  bodyTr: string;
  severity: number;
  startsAt: string;
  endsAt: string;
  targetAllSubscribers: boolean;
  targetPlanIdsJson: string | null;
  targetTiersJson: string | null;
  isPublished: boolean;
}

export interface CreateAnnouncementRequest {
  titleEn: string;
  titleTr: string;
  bodyEn: string;
  bodyTr: string;
  severity: number;
  startsAt: string;
  endsAt: string;
  targetAllSubscribers: boolean;
  targetPlanIdsJson: string | null;
  targetTiersJson: string | null;
  isPublished: boolean;
}

export interface AdminAiSettings {
  enrichmentModel: string;
  defaultChatModel: string;
}

export interface RevenueAnalytics {
  monthlyRecurringRevenue: number;
  mrrCurrency: string;
  payingSubscribers: number;
  averageRevenuePerUser: number;
}

export interface GrowthAnalytics {
  dauYesterday: number;
  mauLast30Days: number;
  churnRatioLast30Days: number;
  dailyActiveSeries: Array<{
    date: string;
    activeUsers: number;
  }>;
  featureTotalsLast30Days: {
    totalOcr: number;
    totalStt: number;
    totalCopilot: number;
  };
}

export interface ErrorLog {
  id: number;
  statusCode: number;
  path: string;
  method: string;
  userId: string;
  exceptionType: string;
  message: string;
  correlationId: string;
  createdUtc: string;
}

export interface Paginated<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminAuditLog {
  id: number;
  actorUserId: string;
  action: string;
  targetUserId: string;
  detailsJson: string;
  ipAddress: string;
  createdUtc: string;
}

export interface AiUsageSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalEstimatedCostUsd: number;
  requestCount: number;
}

export interface FxRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedOn: string;
}

export interface CreateFxRateRequest {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export interface BlockedIp {
  id: number;
  ipAddress: string;
  reason: string;
  createdUtc: string;
  expiresUtc: string;
}

export interface CreateBlockedIpRequest {
  ipAddress: string;
  reason: string;
  expiresUtc: string;
}

