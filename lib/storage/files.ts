import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string = 'investigation-files',
  folder?: string
): Promise<UploadResult> {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    const path = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        url: '',
        path: '',
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path,
    };
  } catch (error: any) {
    console.error('File upload failed:', error);
    return {
      url: '',
      path: '',
      error: error.message,
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  bucket: string = 'investigation-files',
  folder?: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string, bucket: string = 'investigation-files'): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('File deletion failed:', error);
    return false;
  }
}

/**
 * Get file URL
 */
export function getFileUrl(path: string, bucket: string = 'investigation-files'): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Download file as blob
 */
export async function downloadFile(
  path: string,
  bucket: string = 'investigation-files'
): Promise<Blob | null> {
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);

    if (error) {
      console.error('Download error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('File download failed:', error);
    return null;
  }
}

/**
 * Check if file exists
 */
export async function fileExists(path: string, bucket: string = 'investigation-files'): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(path);

    return !error && data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, options?: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options || {}; // Default 10MB

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type;
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        // Handle wildcards like "image/*"
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType + '/');
      }
      return fileType === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type ${fileType} is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Default allowed file types for investigation uploads
 */
export const ALLOWED_INVESTIGATION_FILES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
