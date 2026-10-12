import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'xecgduel',
  api_key: process.env.CLOUDINARY_API_KEY || '275958143852675',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'BU2pvNOffS8TSg7WQXAC6RzItQk',
  secure: true,
});

export default cloudinary;

/**
 * Uploads an image buffer or base64 data string to Cloudinary
 * with automatic WebP/AVIF format and lossless quality optimization.
 */
export async function uploadImageToCloudinary(
  fileBufferOrBase64: string | Buffer,
  folder: string = 'bhumie/properties'
): Promise<{ success: boolean; url: string; optimizedUrl: string; publicId: string; error?: string }> {
  try {
    let uploadData: string;

    if (Buffer.isBuffer(fileBufferOrBase64)) {
      uploadData = `data:image/jpeg;base64,${fileBufferOrBase64.toString('base64')}`;
    } else {
      uploadData = fileBufferOrBase64;
    }

    const res = await cloudinary.uploader.upload(uploadData, {
      folder,
      resource_type: 'image',
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
          crop: 'limit',
          width: 1400,
        },
      ],
    });

    // Generate maximum-performance optimized delivery URL
    const optimizedUrl = cloudinary.url(res.public_id, {
      secure: true,
      quality: 'auto:good',
      fetch_format: 'auto',
      crop: 'limit',
      width: 1200,
    });

    return {
      success: true,
      url: res.secure_url,
      optimizedUrl: optimizedUrl || res.secure_url,
      publicId: res.public_id,
    };
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    return {
      success: false,
      url: '',
      optimizedUrl: '',
      publicId: '',
      error: err.message || 'Image upload failed',
    };
  }
}

/**
 * Transforms any Cloudinary image URL to apply auto-format (WebP/AVIF),
 * auto-compression (q_auto), and responsive width limiting.
 */
export function getOptimizedImageUrl(url: string, width: number = 1200): string {
  if (!url) return '';

  // If it's a Cloudinary URL, inject f_auto,q_auto,c_limit,w_1200
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (url.includes('/f_auto') || url.includes('/q_auto')) {
      return url;
    }
    return url.replace(
      '/image/upload/',
      `/image/upload/f_auto,q_auto,c_limit,w_${width}/`
    );
  }

  return url;
}
