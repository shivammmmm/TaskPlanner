import { apiClient } from '../api/apiClient';
import { Notice } from '../types/entities';

export const noticeService = {
  async getNotices(order?: string, limit?: number): Promise<Notice[]> {
    return apiClient.entities<Notice>('Notice').list(order, limit);
  },

  async filterNotices(query: Partial<Notice>, order?: string, limit?: number): Promise<Notice[]> {
    return apiClient.entities<Notice>('Notice').filter(query, order, limit);
  },

  async createNotice(data: Omit<Notice, 'id' | 'created_date'>): Promise<Notice> {
    return apiClient.entities<Notice>('Notice').create({
      created_date: new Date().toISOString(),
      ...data
    });
  },

  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    return apiClient.entities<Notice>('Notice').update(id, data);
  },

  async deleteNotice(id: string): Promise<boolean> {
    return apiClient.entities<Notice>('Notice').delete(id);
  }
};
