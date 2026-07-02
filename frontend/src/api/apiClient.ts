import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle unauthorized responses
axiosInstance.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_current_user');
    }
  }
  return Promise.reject(error);
});

const ENTITY_ROUTES: Record<string, string> = {
  Employee: '/team-members',
  Bucket: '/buckets',
  Task: '/tasks',
  Attendance: '/attendance',
  Timesheet: '/timesheets',
  Meeting: '/meetings',
  Notice: '/notices',
  Item: '/items',
  ExternalAlert: '/external-alerts',
  Notification: '/notifications',
  Holiday: '/holidays',
  CompanySettings: '/settings',
  ActivityLog: '/reports/dashboard',  // GET uses /dashboard, POST uses /activity-logs
};

class EntityClient<T extends Record<string, any>> {
  private entityName: string;
  private basePath: string;

  constructor(entityName: string) {
    this.entityName = entityName;
    this.basePath = ENTITY_ROUTES[entityName] || `/${entityName.toLowerCase()}s`;
  }

  async list(order?: string, limit?: number): Promise<T[]> {
    const params: any = {};
    if (order) params.order = order;
    if (limit) params.limit = limit;

    const response = await axiosInstance.get(this.basePath, { params });
    return response.data.data;
  }

  async filter(query: Partial<T> | Record<string, any>, order?: string, limit?: number): Promise<T[]> {
    // Special case: task comments endpoint
    if (this.entityName === 'TaskComment' && query.task_id) {
      const response = await axiosInstance.get(`/tasks/${query.task_id}/comments`);
      return response.data.data;
    }

    const params: any = { ...query };
    if (order) params.order = order;
    if (limit) params.limit = limit;

    const response = await axiosInstance.get(this.basePath, { params });
    return response.data.data || [];
  }

  async get(id: string): Promise<T | null> {
    try {
      const response = await axiosInstance.get(`${this.basePath}/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: Omit<T, 'id'> & { id?: string }): Promise<T> {
    // Special case: task comments endpoint
    if (this.entityName === 'TaskComment' && (data as any).task_id) {
      const response = await axiosInstance.post(`/tasks/${(data as any).task_id}/comments`, data);
      return response.data.data;
    }

    // Special case: ActivityLog create uses a different POST path
    const postPath = this.entityName === 'ActivityLog'
      ? '/reports/activity-logs'
      : this.basePath;

    const response = await axiosInstance.post(postPath, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await axiosInstance.put(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<boolean> {
    const response = await axiosInstance.delete(`${this.basePath}/${id}`);
    return response.data.success || true;
  }
}

export const apiClient = {
  entities: <T extends Record<string, any>>(name: string) => {
    return new EntityClient<T>(name);
  }
};
