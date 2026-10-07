import { api } from './api';
import type { AnalysisSession } from '../types';

interface CreateAnalysisData {
  location_image_url: string;
  person_image_url?: string | null;
  vehicle_image_url?: string | null;
  phone_model: string;
  photography_style: string;
  take_my_photo: boolean;
}

interface FullAnalysisResponse {
  session: AnalysisSession;
  scene: any;
  outfit: any;
  vehicle: any;
  camera_recommendations: any[];
  poses: any[];
  shot_plans: any[];
}

export const analysisService = {
  async createAnalysis(data: CreateAnalysisData): Promise<{ id: string; status: string }> {
    const response = await api.post<{ id: string; status: string }>('/api/analysis', data);
    return response.data;
  },

  async getAnalysis(id: string): Promise<FullAnalysisResponse> {
    const response = await api.get<FullAnalysisResponse>(`/api/analysis/${id}`);
    return response.data;
  },

  async getAnalysisHistory(): Promise<AnalysisSession[]> {
    const response = await api.get<AnalysisSession[]>('/api/analysis/history');
    return response.data;
  },

  async deleteAnalysis(id: string): Promise<void> {
    await api.delete(`/api/analysis/${id}`);
  },

  evaluatePhoto: async (data: {
    photo_url: string;
    session_id?: string;
    session_context?: any;
    original_pose?: any;
  }) => {
    const response = await api.post('/api/analysis/evaluate-photo', data);
    return response.data;
  }
};
