import { apiClient } from '../api/apiClient';
import { Bucket } from '../types/entities';

export const bucketService = {
  async getBuckets(order?: string, limit?: number): Promise<Bucket[]> {
    return apiClient.entities<Bucket>('Bucket').list(order, limit);
  },

  async filterBuckets(query: Partial<Bucket>, order?: string, limit?: number): Promise<Bucket[]> {
    return apiClient.entities<Bucket>('Bucket').filter(query, order, limit);
  },

  async getBucket(id: string): Promise<Bucket | null> {
    return apiClient.entities<Bucket>('Bucket').get(id);
  },

  async createBucket(data: Omit<Bucket, 'id'> & { id?: string }): Promise<Bucket> {
    return apiClient.entities<Bucket>('Bucket').create(data);
  },

  async updateBucket(id: string, data: Partial<Bucket>): Promise<Bucket> {
    return apiClient.entities<Bucket>('Bucket').update(id, data);
  },

  async deleteBucket(id: string): Promise<boolean> {
    return apiClient.entities<Bucket>('Bucket').delete(id);
  }
};
