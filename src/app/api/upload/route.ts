import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Case 1: Multipart FormData (Direct File Upload from browser)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const singleFile = formData.get('file') as File | null;

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
        if (!file.type.startsWith('image/')) {
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await uploadImageToCloudinary(buffer, 'bhumie/properties');
        if (uploadResult.success) {
          uploadedUrls.push(uploadResult.optimizedUrl || uploadResult.url);
        } else {
          errors.push(uploadResult.error || 'Upload error');
        }
      }

      if (uploadedUrls.length === 0) {
        return NextResponse.json(
          { success: false, message: errors.join(', ') || 'Failed to upload images to Cloudinary.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
        message: `${uploadedUrls.length} image(s) uploaded and optimized successfully via Cloudinary.`,
      });
    }

    // Case 2: JSON Payload (Base64 or Remote Image URL to re-upload to Cloudinary)
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
