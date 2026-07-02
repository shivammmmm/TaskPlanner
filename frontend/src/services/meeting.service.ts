import { apiClient } from '../api/apiClient';
import { Meeting } from '../types/entities';

export const meetingService = {
  async getMeetings(order?: string, limit?: number): Promise<Meeting[]> {
    return apiClient.entities<Meeting>('Meeting').list(order, limit);
  },

  async filterMeetings(query: Partial<Meeting>, order?: string, limit?: number): Promise<Meeting[]> {
    return apiClient.entities<Meeting>('Meeting').filter(query, order, limit);
  },

  async createMeeting(data: Omit<Meeting, 'id'> & { id?: string }): Promise<Meeting> {
    return apiClient.entities<Meeting>('Meeting').create(data);
  },

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    return apiClient.entities<Meeting>('Meeting').update(id, data);
  },

  async deleteMeeting(id: string): Promise<boolean> {
    return apiClient.entities<Meeting>('Meeting').delete(id);
  }
};
