import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { uploadToCloudinary } from '@/lib/services/cloudinaryService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to upload files.' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'No file provided.' } },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'File is too large (max 5MB).' } },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(base64Data, 'borrow_hub_items');

    return NextResponse.json({
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload file.' } },
      { status: 500 }
    );
  }
}
