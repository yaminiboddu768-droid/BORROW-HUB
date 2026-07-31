import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Fetch all borrow requests where the item is owned by the current user
    const requests = await prisma.borrowRequest.findMany({
      where: {
        item: {
          ownerId: session.user.id
        }
      },
      include: {
        item: { select: { id: true, name: true, pricePerDay: true, source: true, platformName: true } },
        borrower: { select: { name: true, email: true, averageRating: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('GET Lending Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch lending requests' } },
      { status: 500 }
    );
  }
}
