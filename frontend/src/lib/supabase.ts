/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

const isDummy = supabaseUrl.includes('dummy') || !import.meta.env.VITE_SUPABASE_URL;

class MockAuth {
  private getSessionData() {
    const session = localStorage.getItem('poseai_session');
    if (session) {
      try { return JSON.parse(session); } catch (e) {}
    }
    const defaultSession = {
      access_token: 'mock-token-mock-user-12345',
      user: {
        id: 'mock-user-12345',
        email: 'photographer@poseai.local',
        user_metadata: { display_name: 'Photographer' }
      }
    };
    try { localStorage.setItem('poseai_session', JSON.stringify(defaultSession)); } catch (e) {}
    return defaultSession;
  }

  async getSession() {
    const session = this.getSessionData();
    return { data: { session }, error: null };
  }

  async getUser() {
    const session = this.getSessionData();
    return { data: { user: session?.user || null }, error: null };
  }

  async signUp({ email, password, options }: any) {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const user = {
      id: generateUUID(),
      email,
      user_metadata: options?.data || { display_name: email.split('@')[0] },
    };
    const session = {
      access_token: 'mock-token-' + user.id,
      user,
    };
    localStorage.setItem('poseai_session', JSON.stringify(session));
    this.triggerAuthChange('SIGNED_IN', session);
    return { data: { user, session }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const user = {
      id: 'mock-user-12345',
      email,
      user_metadata: { display_name: email.split('@')[0] },
    };
    const session = {
      access_token: 'mock-token-' + user.id,
      user,
    };
    localStorage.setItem('poseai_session', JSON.stringify(session));
    this.triggerAuthChange('SIGNED_IN', session);
    return { data: { user, session }, error: null };
  }

  async signOut() {
    localStorage.removeItem('poseai_session');
    this.triggerAuthChange('SIGNED_OUT', null);
    return { error: null };
  }

  private listeners: any[] = [];

  onAuthStateChange(callback: any) {
    this.listeners.push(callback);
    const session = this.getSessionData();
    // Immediate callback
    setTimeout(() => callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session), 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private triggerAuthChange(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
  }

  async resetPasswordForEmail(email: string, options: any) {
    return { data: {}, error: null };
  }
}

class MockStorageBucket {
  private static urlMap: Map<string, string> = new Map();

  constructor(private bucketName: string) {}

  async upload(path: string, file: File, options?: any) {
    const formData = new FormData();
    formData.append('file', file);
    
    const sessionStr = localStorage.getItem('poseai_session');
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    const headers: any = {
      'Content-Type': 'multipart/form-data',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/upload`,
      formData,
      { headers }
    );
    const returnUrl = response.data?.url || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/static/uploads/${response.data?.path || path}`;
    MockStorageBucket.urlMap.set(path, returnUrl);
    return { data: { ...response.data, url: returnUrl, publicUrl: returnUrl }, error: null };
  }

  getPublicUrl(path: string) {
    const mapped = MockStorageBucket.urlMap.get(path);
    return {
      data: {
        publicUrl: mapped || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/static/uploads/${path}`,
      },
    };
  }

  async remove(paths: string[]) {
    return { data: null, error: null };
  }

  async createSignedUrl(path: string, expiresIn: number) {
    return {
      data: {
        signedUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/static/uploads/${path}`,
      },
      error: null,
    };
  }
}

class MockStorage {
  from(bucketName: string) {
    return new MockStorageBucket(bucketName);
  }
}

const mockSupabase = {
  auth: new MockAuth(),
  storage: new MockStorage(),
};

if (isDummy) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env. Using mock mode.');
}

export const supabase = isDummy ? (mockSupabase as any) : createClient(supabaseUrl, supabaseAnonKey);

