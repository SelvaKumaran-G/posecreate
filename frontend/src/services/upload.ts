import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const uploadService = {
  validateImage(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPG, PNG and WebP are supported.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File is too large. Maximum size is 10MB.' };
    }
    return { valid: true };
  },

  async uploadImage(file: File, bucket: string, path: string): Promise<string> {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const uploadRes = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadRes.error) throw uploadRes.error;
    
    // Check if direct public URL returned by upload response
    if (uploadRes.data?.url) {
      return uploadRes.data.url;
    }
    if (uploadRes.data?.publicUrl) {
      return uploadRes.data.publicUrl;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return publicUrl;
  },

  async deleteImage(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
  },

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
      
    if (error) throw error;
    return data.signedUrl;
  }
};
