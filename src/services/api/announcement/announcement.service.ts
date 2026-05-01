import { apiRequest } from '../../apiClient';
import type { AnnouncementDto } from './announcement.models';

export const announcementService = {
  async getActiveAnnouncements(language: string = 'en'): Promise<AnnouncementDto[]> {
    return apiRequest<AnnouncementDto[]>(`Announcements/active?language=${language}`, { 
      method: 'GET',
      requiresAuth: false 
    });
  }
};
