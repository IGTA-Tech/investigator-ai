import { NextRequest, NextResponse } from 'next/server';
import { uploadFiles, validateFile, ALLOWED_INVESTIGATION_FILES } from '@/lib/storage/files';

/**
 * POST /api/upload
 * Upload files to Supabase Storage
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate all files
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateFile(file, {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: ALLOWED_INVESTIGATION_FILES,
      });

      if (!validation.valid) {
        validationErrors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'File validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Upload files
    const uploadResults = await uploadFiles(files, 'investigation-files');

    // Check for upload errors
    const errors = uploadResults.filter(r => r.error);
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Some files failed to upload',
          details: errors.map(e => e.error),
          partial: uploadResults.filter(r => !r.error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadResults.map(r => ({
        url: r.url,
        path: r.path,
      })),
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
