import { apiClient, axiosInstance } from '../api/apiClient';
import { Task, TaskComment } from '../types/entities';

export const taskService = {
  // Task operations
  async getTasks(order?: string, limit?: number): Promise<Task[]> {
    return apiClient.entities<Task>('Task').list(order, limit);
  },

  async filterTasks(query: Partial<Task>, order?: string, limit?: number): Promise<Task[]> {
    return apiClient.entities<Task>('Task').filter(query, order, limit);
  },

  async getTask(id: string): Promise<Task | null> {
    return apiClient.entities<Task>('Task').get(id);
  },

  async createTask(data: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
    return apiClient.entities<Task>('Task').create(data);
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return apiClient.entities<Task>('Task').update(id, data);
  },

  async deleteTask(id: string): Promise<boolean> {
    return apiClient.entities<Task>('Task').delete(id);
  },

  // TaskComment operations
  async getComments(query: Partial<TaskComment>, order?: string, limit?: number): Promise<TaskComment[]> {
    return apiClient.entities<TaskComment>('TaskComment').filter(query, order, limit);
  },

  async createComment(data: Omit<TaskComment, 'id' | 'created_date'>): Promise<TaskComment> {
    return apiClient.entities<TaskComment>('TaskComment').create({
      created_date: new Date().toISOString(),
      ...data
    });
  },

  async getAttachments(taskId: string): Promise<any[]> {
    const response = await axiosInstance.get(`/tasks/${taskId}/attachments`);
    return response.data.data;
  },

  async uploadAttachment(taskId: string, data: Record<string, any>): Promise<any> {
    const response = await axiosInstance.post(`/tasks/${taskId}/attachments`, data);
    return response.data.data;
  },

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await axiosInstance.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }
};
