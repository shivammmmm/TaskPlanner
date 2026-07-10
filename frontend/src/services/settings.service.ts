import { apiClient, axiosInstance } from '../api/apiClient';
import { CompanySettings, Holiday, Notification, ExternalAlert } from '../types/entities';

export const settingsService = {
  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | null> {
    const list = await apiClient.entities<CompanySettings>('CompanySettings').list();
    return list.length > 0 ? list[0] : null;
  },

  async createCompanySettings(data: Omit<CompanySettings, 'id'>): Promise<CompanySettings> {
    return apiClient.entities<CompanySettings>('CompanySettings').update('', data);
  },

  async updateCompanySettings(id: string, data: Partial<CompanySettings>): Promise<CompanySettings> {
    return apiClient.entities<CompanySettings>('CompanySettings').update(id, data);
  },

  // Holidays
  async getHolidays(order?: string, limit?: number): Promise<Holiday[]> {
    return apiClient.entities<Holiday>('Holiday').list(order, limit);
  },

  async createHoliday(data: Omit<Holiday, 'id'>): Promise<Holiday> {
    return apiClient.entities<Holiday>('Holiday').create(data);
  },

  async deleteHoliday(id: string): Promise<boolean> {
    return apiClient.entities<Holiday>('Holiday').delete(id);
  },

  // Notifications
  async getNotifications(userId: string, order?: string, limit?: number): Promise<Notification[]> {
    const list = await apiClient.entities<Notification>('Notification').filter({ user_id: userId }, order, limit);
    
    // Seed default notifications if empty
    if (list.length === 0) {
      const defaultNotifications = [
        {
          user_id: userId,
          title: 'Welcome to Apex Taskplanner',
          message: 'Get started by checking your active tasks or marking your daily attendance.',
          type: 'info',
          is_read: false,
          link: '/',
          created_date: new Date().toISOString()
        },
        {
          user_id: userId,
          title: 'New Notice Published',
          message: 'Jane Cooper published: "Q3 Product Strategy Alignment Meeting"',
          type: 'notice',
          is_read: false,
          link: '/notices',
          created_date: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      for (const n of defaultNotifications) {
        await apiClient.entities<Notification>('Notification').create(n);
      }
      return apiClient.entities<Notification>('Notification').filter({ user_id: userId }, order, limit);
    }
    
    return list;
  },

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    if (data.is_read) {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return response.data.data;
    }
    return apiClient.entities<Notification>('Notification').update(id, data);
  },

  async markAllNotificationsRead(): Promise<void> {
    await axiosInstance.patch('/notifications/read-all');
  },

  async createNotification(data: Omit<Notification, 'id' | 'created_date'>): Promise<Notification> {
    return apiClient.entities<Notification>('Notification').create({
      created_date: new Date().toISOString(),
      ...data
    });
  },

  // External Alerts
  async getAlerts(order?: string, limit?: number): Promise<ExternalAlert[]> {
    return apiClient.entities<ExternalAlert>('ExternalAlert').list(order, limit);
  },

  async createAlert(data: Omit<ExternalAlert, 'id' | 'created_date'>): Promise<ExternalAlert> {
    return apiClient.entities<ExternalAlert>('ExternalAlert').create({
      created_date: new Date().toISOString(),
      ...data
    });
  },

  async updateAlert(id: string, data: Partial<ExternalAlert>): Promise<ExternalAlert> {
    return apiClient.entities<ExternalAlert>('ExternalAlert').update(id, data);
  },

  async deleteAlert(id: string): Promise<boolean> {
    return apiClient.entities<ExternalAlert>('ExternalAlert').delete(id);
  }
};
