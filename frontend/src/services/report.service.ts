import { apiClient } from '../api/apiClient';

export interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  details: string;
  created_date: string;
}

export const reportService = {
  // Activity logs for Dashboard
  async getActivityLogs(limit = 8): Promise<ActivityLog[]> {
    const logs = await apiClient.entities<ActivityLog>('ActivityLog').list('-created_date', limit);
    return logs;
  },

  async logActivity(userName: string, action: string, details: string): Promise<ActivityLog> {
    return apiClient.entities<ActivityLog>('ActivityLog').create({
      user_name: userName,
      action,
      details,
      created_date: new Date().toISOString()
    });
  }
};
