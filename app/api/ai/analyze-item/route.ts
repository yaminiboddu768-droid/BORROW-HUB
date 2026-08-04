import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { analyzeUploadedImages } from '@/lib/services/aiVisionService';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to use AI Snap & List.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { filenames = [], images = [], imageUrls = [] } = body;

    const allImages = [...images, ...imageUrls];

    if (filenames.length === 0 && allImages.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'No image files provided for AI analysis.' } },
        { status: 400 }
      );
    }

    // Call modular AI vision service
    const result = await analyzeUploadedImages({
      images: allImages,
      filenames,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'AI processing failed. Please fill details manually.' } },
      { status: 500 }
    );
  }
}
