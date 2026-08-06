import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 403 });
    }

    const requests = await prisma.borrowRequest.findMany({
      include: {
        item: { select: { name: true, category: true, ownerId: true } },
        borrower: { select: { name: true, email: true } },
        payment: { select: { status: true, amount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Admin Requests GET Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}
