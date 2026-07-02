import { apiClient } from '../api/apiClient';
import { Item } from '../types/entities';

export const itemService = {
  async getItems(order?: string, limit?: number): Promise<Item[]> {
    return apiClient.entities<Item>('Item').list(order, limit);
  },

  async filterItems(query: Partial<Item>, order?: string, limit?: number): Promise<Item[]> {
    return apiClient.entities<Item>('Item').filter(query, order, limit);
  },

  async createItem(data: Omit<Item, 'id'> & { id?: string }): Promise<Item> {
    return apiClient.entities<Item>('Item').create(data);
  },

  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    return apiClient.entities<Item>('Item').update(id, data);
  },

  async deleteItem(id: string): Promise<boolean> {
    return apiClient.entities<Item>('Item').delete(id);
  }
};
