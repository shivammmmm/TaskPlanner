import { apiClient } from '../api/apiClient';
import { Attendance } from '../types/entities';

export const attendanceService = {
  async getAttendance(order?: string, limit?: number): Promise<Attendance[]> {
    return apiClient.entities<Attendance>('Attendance').list(order, limit);
  },

  async filterAttendance(query: Partial<Attendance>, order?: string, limit?: number): Promise<Attendance[]> {
    return apiClient.entities<Attendance>('Attendance').filter(query, order, limit);
  },

  async createAttendance(data: Omit<Attendance, 'id'> & { id?: string }): Promise<Attendance> {
    return apiClient.entities<Attendance>('Attendance').create(data);
  },

  async updateAttendance(id: string, data: Partial<Attendance>): Promise<Attendance> {
    return apiClient.entities<Attendance>('Attendance').update(id, data);
  },

  async deleteAttendance(id: string): Promise<boolean> {
    return apiClient.entities<Attendance>('Attendance').delete(id);
  }
};
