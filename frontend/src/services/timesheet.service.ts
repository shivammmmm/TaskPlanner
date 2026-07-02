import { apiClient } from '../api/apiClient';
import { Timesheet } from '../types/entities';

export const timesheetService = {
  async getTimesheets(order?: string, limit?: number): Promise<Timesheet[]> {
    return apiClient.entities<Timesheet>('Timesheet').list(order, limit);
  },

  async filterTimesheets(query: Partial<Timesheet>, order?: string, limit?: number): Promise<Timesheet[]> {
    return apiClient.entities<Timesheet>('Timesheet').filter(query, order, limit);
  },

  async createTimesheet(data: Omit<Timesheet, 'id'> & { id?: string }): Promise<Timesheet> {
    return apiClient.entities<Timesheet>('Timesheet').create(data);
  },

  async updateTimesheet(id: string, data: Partial<Timesheet>): Promise<Timesheet> {
    return apiClient.entities<Timesheet>('Timesheet').update(id, data);
  },

  async deleteTimesheet(id: string): Promise<boolean> {
    return apiClient.entities<Timesheet>('Timesheet').delete(id);
  }
};
