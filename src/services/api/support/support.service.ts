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
  /** Query: `take` page size, optional `status` = 0 | 1 | 2. */
  async getAdminTickets(take: number, status?: number): Promise<SupportTicket[]> {
    const params = new URLSearchParams()
    if (status !== undefined && status !== null) {
      params.set('status', String(status))
    }
    params.set('take', String(take))
    const q = params.toString()
    return apiRequest<SupportTicket[]>(`support/tickets/admin?${q}`, {
      method: 'GET',
    })
  },

  async replyTicket(id: number, data: ReplySupportTicketRequest): Promise<void> {
    return apiRequest<void>(`support/tickets/${id}/reply`, { 
      method: 'POST', 
      body: data 
    });
  }
};
