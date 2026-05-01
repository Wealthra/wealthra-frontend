import { apiRequest } from '../../apiClient';
import type {
  AdminUser,
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
  SupportTicket,
  BlockedIp
} from './admin.models';

export const adminService = {
  // --- Admin Users ---
  async getUsers(page: number = 1, pageSize: number = 20, search: string = ''): Promise<Paginated<AdminUser>> {
    return apiRequest<Paginated<AdminUser>>(`admin/users?page=${page}&pageSize=${pageSize}&search=${search}`, { method: 'GET' });
  },
  async getUserDetails(userId: string): Promise<AdminUser> {
    return apiRequest<AdminUser>(`admin/users/${userId}`, { method: 'GET' });
  },
  async lockUser(userId: string, lockoutEnd?: string): Promise<void> {
    return apiRequest<void>(`admin/users/${userId}/lock`, { method: 'POST', body: { lockoutEnd } });
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
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<AdminAnnouncement> {
    return apiRequest<AdminAnnouncement>('admin/announcements', { method: 'POST', body: data });
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
  async getErrors(page: number = 1, pageSize: number = 50, statusCode?: number): Promise<Paginated<ErrorLog>> {
    let url = `admin/monitoring/errors?page=${page}&pageSize=${pageSize}`;
    if (statusCode) url += `&statusCode=${statusCode}`;
    return apiRequest<Paginated<ErrorLog>>(url, { method: 'GET' });
  },
  async getAuditLogs(page: number = 1, pageSize: number = 50, actor?: string): Promise<Paginated<AdminAuditLog>> {
    let url = `admin/monitoring/audit?page=${page}&pageSize=${pageSize}`;
    if (actor) url += `&actor=${actor}`;
    return apiRequest<Paginated<AdminAuditLog>>(url, { method: 'GET' });
  },
  async getAiUsage(startDate: string, endDate: string): Promise<AiUsageSummary[]> {
    return apiRequest<AiUsageSummary[]>(`admin/monitoring/ai-usage?startDate=${startDate}&endDate=${endDate}`, { method: 'GET' });
  },

  // --- Admin FX Controls ---
  async getManualRates(): Promise<FxRate[]> {
    return apiRequest<FxRate[]>('admin/fx/manual-rates', { method: 'GET' });
  },
  async setManualRate(data: FxRate): Promise<void> {
    return apiRequest<void>('admin/fx/manual-rates', { method: 'POST', body: data });
  },
  async getProviderOrder(): Promise<string[]> {
    return apiRequest<string[]>('admin/fx/provider-order', { method: 'GET' });
  },
  async updateProviderOrder(order: string[]): Promise<void> {
    return apiRequest<void>('admin/fx/provider-order', { method: 'PUT', body: order });
  },

  // --- Admin Security ---
  async getBlockedIps(): Promise<BlockedIp[]> {
    return apiRequest<BlockedIp[]>('admin/security/blocked-ips', { method: 'GET' });
  },
  async blockIp(data: BlockedIp): Promise<void> {
    return apiRequest<void>('admin/security/blocked-ips', { method: 'POST', body: data });
  },
  async unblockIp(ip: string): Promise<void> {
    return apiRequest<void>(`admin/security/blocked-ips/${encodeURIComponent(ip)}`, { method: 'DELETE' });
  },

  // --- Admin Support Tickets ---
  async getTickets(status?: string, limit?: number): Promise<SupportTicket[]> {
    let url = 'support/tickets/admin?';
    if (status) url += `status=${status}&`;
    if (limit) url += `limit=${limit}`;
    return apiRequest<SupportTicket[]>(url, { method: 'GET' });
  },
  async replyTicket(id: number, message: string, newStatus?: string): Promise<void> {
    return apiRequest<void>(`support/tickets/${id}/reply`, { method: 'POST', body: { message, newStatus } });
  }
};
