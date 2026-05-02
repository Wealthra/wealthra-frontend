import { apiRequest } from '../../apiClient';
import type { AnnouncementDto } from './announcement.models';

export const announcementService = {
  async getActiveAnnouncements(): Promise<AnnouncementDto[]> {
    return apiRequest<AnnouncementDto[]>('Announcements/active', { 
      method: 'GET',
      requiresAuth: true 
    });
  }
};
