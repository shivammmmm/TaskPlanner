import { apiClient } from '../api/apiClient';
import { User, Employee } from '../types/entities';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Get current logged-in user
  async me(): Promise<User> {
    const token = localStorage.getItem('tp_token');
    if (!token) {
      const err = new Error('Unauthorized');
      (err as any).status = 401;
      throw err;
    }
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data.data;
    localStorage.setItem('tp_current_user', JSON.stringify(user));
    return user;
  },

  // Log in with email/password
  async loginViaEmailPassword(email: string, password?: string): Promise<User> {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('tp_token', token);
    localStorage.setItem('tp_current_user', JSON.stringify(user));
    return user;
  },

  // Google Login / OAuth Mock
  loginWithProvider(provider: string, _redirectTo: string): void {
    throw new Error('OAuth login is disabled. Please log in with your credentials.');
  },

  // Register an account
  async register(params: any): Promise<{ success: boolean; email: string }> {
    throw new Error('Registration disabled. Contact Super Admin.');
  },

  // Verify OTP Code
  async verifyOtp(params: any): Promise<{ access_token: string; user: User }> {
    throw new Error('Registration disabled. Contact Super Admin.');
  },

  // Resend OTP Mock
  async resendOtp(email: string): Promise<boolean> {
    return true;
  },

  // Logout
  logout(shouldRedirect = true): void {
    const token = localStorage.getItem('tp_token');
    localStorage.removeItem('tp_current_user');
    localStorage.removeItem('tp_token');
    if (token) {
      axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  },

  setToken(token: string): void {
    localStorage.setItem('tp_token', token);
  },

  // Forgot password mock
  async forgotPassword(email: string): Promise<boolean> {
    console.log(`Forgot password link requested for ${email}`);
    return true;
  },

  // Reset password mock
  async resetPassword(params: any): Promise<boolean> {
    console.log(`Password reset mock called`);
    return true;
  },

  // Update current user
  async updateMe(data: Partial<User>): Promise<User> {
    const token = localStorage.getItem('tp_token');
    const response = await axios.put(`${API_URL}/auth/me`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data.data;
    localStorage.setItem('tp_current_user', JSON.stringify(user));
    return user;
  },

  // Employee CRM CRUD Operations
  async listEmployees(order?: string, limit?: number): Promise<Employee[]> {
    return apiClient.entities<Employee>('Employee').list(order, limit);
  },

  async filterEmployees(query: Partial<Employee>, order?: string, limit?: number): Promise<Employee[]> {
    return apiClient.entities<Employee>('Employee').filter(query, order, limit);
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    return apiClient.entities<Employee>('Employee').get(id);
  },

  async createEmployee(data: any): Promise<Employee> {
    return apiClient.entities<Employee>('Employee').create(data);
  },

  async updateEmployee(id: string, data: any): Promise<Employee> {
    return apiClient.entities<Employee>('Employee').update(id, data);
  },

  async deleteEmployee(id: string): Promise<boolean> {
    return apiClient.entities<Employee>('Employee').delete(id);
  }
};
