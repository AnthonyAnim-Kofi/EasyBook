import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

export const uploadImage = async (uri, bucket = 'business-gallery') => {
  try {
    if (!uri) return null;
    
    // If it's already a remote URL, return it
    if (uri.startsWith('http')) return uri;

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${fileName}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};
