import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Case 1: Multipart FormData (Direct File Upload from browser)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const singleFile = formData.get('file') as File | null;
      const targetFolder = (formData.get('folder') as string) || 'bhumie/properties';

      const uploadFiles: File[] = [];
      if (files && files.length > 0) {
        uploadFiles.push(...files);
      } else if (singleFile) {
        uploadFiles.push(singleFile);
      }

      if (uploadFiles.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No image files provided.' },
          { status: 400 }
        );
      }

      const uploadedUrls: string[] = [];
      const errors: string[] = [];

      for (const file of uploadFiles) {
        // Accept image MIME types, empty MIME types (common on mobile uploads), or image file extensions
        const isImage =
          !file.type ||
          file.type.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp|heic|heif|gif|bmp|tiff)$/i.test(file.name);

        if (!isImage) {
          continue;
        }

        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadResult = await uploadImageToCloudinary(buffer, targetFolder);
          if (uploadResult.success) {
            uploadedUrls.push(uploadResult.optimizedUrl || uploadResult.url);
          } else {
            errors.push(uploadResult.error || 'Upload error');
          }
        } catch (err: any) {
          errors.push(err.message || 'File processing error');
        }
      }

      if (uploadedUrls.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: errors.join(', ') || 'Failed to upload image(s) to Cloudinary.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
        message: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    }

    // Case 2: JSON Payload (Base64 data URI or remote image URL)
    const body = await req.json();
    const { image, url, folder = 'bhumie/properties' } = body;

    const source = image || url;
    if (!source) {
      return NextResponse.json(
        { success: false, message: 'Missing image data (base64 or image url).' },
        { status: 400 }
      );
    }

    const uploadResult = await uploadImageToCloudinary(source, folder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Cloudinary upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.optimizedUrl || uploadResult.url,
      urls: [uploadResult.optimizedUrl || uploadResult.url],
      originalUrl: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  } catch (error: any) {
    console.error('API /upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error during upload.' },
      { status: 500 }
    );
  }
}
