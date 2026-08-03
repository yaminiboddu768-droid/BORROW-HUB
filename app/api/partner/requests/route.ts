import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

async function checkPartnerAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  const user = session.user as any;
  if (user.role !== 'partner' || user.partnerStatus !== 'approved') return null;
  return user.id;
}

export async function GET(req: Request) {
  try {
    const ownerId = await checkPartnerAuth();
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const requests = await prisma.borrowRequest.findMany({
      where: {
        item: { ownerId }
      },
      include: {
        item: true,
        borrower: {
          select: { id: true, name: true, email: true, averageRating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
