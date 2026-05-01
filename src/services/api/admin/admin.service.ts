import { apiRequest } from '../../apiClient';
import type {
  AdminUser,
  AdminUserDetails,
  AdminAnnouncement,
  CreateAnnouncementRequest,
  AdminAiSettings,
  RevenueAnalytics,
  GrowthAnalytics,
  ErrorLog,
  Paginated,
  AdminAuditLog,
  AiUsageSummary,
  FxRate,
  CreateFxRateRequest,
  BlockedIp,
  CreateBlockedIpRequest
} from './admin.models';

export const adminService = {
  // --- Admin Users ---
  async getUsers(page: number = 1, pageSize: number = 20, search: string = ''): Promise<Paginated<AdminUser>> {
    // API uses page and pageSize as query params based on the provided spec
    return apiRequest<Paginated<AdminUser>>(`admin/users?page=${page}&pageSize=${pageSize}&search=${search}`, { method: 'GET' });
  },
  async getUserDetails(userId: string): Promise<AdminUserDetails> {
    return apiRequest<AdminUserDetails>(`admin/users/${userId}`, { method: 'GET' });
  },
  async lockUser(userId: string, lockout: boolean, lockoutEnd?: string): Promise<void> {
    return apiRequest<void>(`admin/users/${userId}/lock`, { method: 'POST', body: { lockout, lockoutEnd } });
  },
  async updateRoles(userId: string, roles: string[]): Promise<void> {
    return apiRequest<void>(`admin/users/${userId}/roles`, { method: 'PUT', body: roles });
  },
  async revokeSessions(userId: string): Promise<void> {
    return apiRequest<void>(`admin/users/${userId}/revoke-sessions`, { method: 'POST' });
  },
  async setPassword(userId: string, newPassword: string): Promise<void> {
    return apiRequest<void>(`admin/users/${userId}/password`, { method: 'POST', body: { newPassword } });
  },

  // --- Admin Announcements ---
  async getAnnouncements(): Promise<AdminAnnouncement[]> {
    return apiRequest<AdminAnnouncement[]>('admin/announcements', { method: 'GET' });
  },
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<number> {
    return apiRequest<number>('admin/announcements', { method: 'POST', body: data });
  },
  async deleteAnnouncement(id: number): Promise<void> {
    return apiRequest<void>(`admin/announcements/${id}`, { method: 'DELETE' });
  },

  // --- Admin AI Runtime Settings ---
  async getAiSettings(): Promise<AdminAiSettings> {
    return apiRequest<AdminAiSettings>('admin/settings/ai', { method: 'GET' });
  },
  async updateAiSettings(data: AdminAiSettings): Promise<void> {
    return apiRequest<void>('admin/settings/ai', { method: 'PUT', body: data });
  },

  // --- Admin Analytics ---
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    return apiRequest<RevenueAnalytics>('admin/analytics/revenue', { method: 'GET' });
  },
  async getGrowthAnalytics(): Promise<GrowthAnalytics> {
    return apiRequest<GrowthAnalytics>('admin/analytics/growth', { method: 'GET' });
  },

  // --- Admin Monitoring ---
  async getErrors(skip: number = 0, take: number = 50, statusCode?: number): Promise<ErrorLog[]> {
    let url = `admin/monitoring/errors?skip=${skip}&take=${take}`;
    if (statusCode) url += `&statusCode=${statusCode}`;
    return apiRequest<ErrorLog[]>(url, { method: 'GET' });
  },
  async getAuditLogs(skip: number = 0, take: number = 50, actorUserId?: string): Promise<AdminAuditLog[]> {
    let url = `admin/monitoring/audit?skip=${skip}&take=${take}`;
    if (actorUserId) url += `&actorUserId=${actorUserId}`;
    return apiRequest<AdminAuditLog[]>(url, { method: 'GET' });
  },
  async getAiUsage(days: number = 7): Promise<AiUsageSummary> {
    return apiRequest<AiUsageSummary>(`admin/monitoring/ai-usage?days=${days}`, { method: 'GET' });
  },

  // --- Admin FX Controls ---
  async getManualRates(): Promise<FxRate[]> {
    return apiRequest<FxRate[]>('admin/fx/manual-rates', { method: 'GET' });
  },
  async setManualRate(data: CreateFxRateRequest): Promise<number> {
    return apiRequest<number>('admin/fx/manual-rates', { method: 'POST', body: data });
  },
  async getProviderOrder(): Promise<string> {
    return apiRequest<string>('admin/fx/provider-order', { method: 'GET' });
  },
  async updateProviderOrder(providerOrderJson: string): Promise<void> {
    return apiRequest<void>('admin/fx/provider-order', { method: 'PUT', body: { providerOrderJson } });
  },

  // --- Admin Security ---
  async getBlockedIps(): Promise<BlockedIp[]> {
    return apiRequest<BlockedIp[]>('admin/security/blocked-ips', { method: 'GET' });
  },
  async blockIp(data: CreateBlockedIpRequest): Promise<number> {
    return apiRequest<number>('admin/security/blocked-ips', { method: 'POST', body: data });
  },
  async unblockIp(ip: string): Promise<void> {
    return apiRequest<void>(`admin/security/blocked-ips/${encodeURIComponent(ip)}`, { method: 'DELETE' });
  },

};
