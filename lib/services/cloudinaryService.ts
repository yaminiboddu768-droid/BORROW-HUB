export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Production Cloudinary Upload Service
 * Handles secure image uploads to Cloudinary.
 * Base64 fallback is STRICTLY disabled for production scalability.
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'borrow_hub_items'
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'borrow_hub_preset';
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || (!uploadPreset && !apiKey)) {
    throw new Error('Cloudinary configuration is missing. Cannot upload image to production.');
  }

  if (!fileData.startsWith('data:image/')) {
    throw new Error('Invalid file data format. Expected Base64 data URL.');
  }

  try {
    const formData = new URLSearchParams();
    formData.append('file', fileData);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);
    
    // Request optimized WebP format
    formData.append('format', 'webp');
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.secure_url) {
        return {
          secureUrl: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
          bytes: data.bytes,
        };
      }
    } else {
      const errorData = await res.json();
      throw new Error(`Cloudinary API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw err;
  }
  
  throw new Error('Failed to parse Cloudinary response.');
}
