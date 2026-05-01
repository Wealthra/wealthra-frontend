export interface SupportTicket {
  id: number;
  userId: string;
  /** Present on some endpoints (e.g. mine); admin list may omit. */
  userEmail?: string;
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

/** Ticket reply body — API expects numeric status (e.g. 0 Open, 1 Pending, 2 Closed). */
export interface ReplySupportTicketRequest {
  adminReply: string;
  status: number;
}
