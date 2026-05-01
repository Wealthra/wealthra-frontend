export interface SupportTicket {
  id: number;
  userId: string;
  userEmail: string;
  subject: string;
  body?: string;
  status: number;
  createdOn: string;
  lastModifiedOn?: string;
  adminReply?: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  body: string;
  priority?: number;
}

export interface ReplySupportTicketRequest {
  body: string;
  newStatus?: string;
}
