import { api } from './api';
import { PhoneModel } from '../types';

export const phoneService = {
  async getPhones(): Promise<PhoneModel[]> {
    const response = await api.get<PhoneModel[]>('/api/phones');
    return response.data;
  },

  async getPhoneById(id: string): Promise<PhoneModel> {
    const response = await api.get<PhoneModel>(`/api/phones/${id}`);
    return response.data;
  }
};
