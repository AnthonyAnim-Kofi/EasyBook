import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const uploadImage = async (uri, bucket = 'business-gallery') => {
  try {
    if (!uri) return null;
    
    // If it's already a remote URL (but not a local blob URL), return it
    if (uri.startsWith('http') && !uri.startsWith('blob:http')) return uri;

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${fileName}`;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
        });
        
      if (error) throw error;
    } else {
      // Read file as base64 for native apps
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};
