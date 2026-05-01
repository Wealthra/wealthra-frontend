export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isLocked: boolean;
  lockoutEnd?: string;
  roles: string[];
  createdAt: string;
}

export interface AdminAnnouncement {
  id: number;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  type: string;
  expiresAt?: string;
}

export interface AdminAiSettings {
  modelName: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  isEnabled: boolean;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export interface GrowthAnalytics {
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  churnRate: number;
}

export interface ErrorLog {
  id: number;
  message: string;
  source: string;
  endpoint: string;
  timestamp: string;
  userId: string;
}

export interface Paginated<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminAuditLog {
  id: number;
  actorEmail: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
}

export interface AiUsageSummary {
  date: string;
  totalTokens: number;
  totalCost: number;
  requests: number;
}

export interface FxRate {
  currencyPair: string;
  rate: number;
  lastUpdated: string;
}

export interface SupportTicket {
  id: number;
  userEmail: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface BlockedIp {
  ip: string;
  reason: string;
  blockedAt: string;
}
