import { apiRequest } from '../../apiClient';
import type { 
  SupportTicket, 
  CreateSupportTicketRequest, 
  ReplySupportTicketRequest 
} from './support.models';

export const supportService = {
  // --- User Facing ---
  async getMyTickets(): Promise<SupportTicket[]> {
    return apiRequest<SupportTicket[]>('support/tickets/mine', { 
      method: 'GET' 
    });
  },

  async createTicket(data: CreateSupportTicketRequest): Promise<number> {
    return apiRequest<number>('support/tickets', { 
      method: 'POST', 
      body: data 
    });
  },

  async getTicketById(id: number): Promise<SupportTicket> {
    return apiRequest<SupportTicket>(`support/tickets/${id}`, { 
      method: 'GET' 
    });
  },

  // --- Admin Facing ---
  async getAdminTickets(status?: string, limit?: number): Promise<SupportTicket[]> {
    let url = 'support/tickets/admin?';
    if (status) url += `status=${status}&`;
    if (limit) url += `limit=${limit}`;
    return apiRequest<SupportTicket[]>(url, { 
      method: 'GET' 
    });
  },

  async replyTicket(id: number, data: ReplySupportTicketRequest): Promise<void> {
    return apiRequest<void>(`support/tickets/${id}/reply`, { 
      method: 'POST', 
      body: data 
    });
  }
};
