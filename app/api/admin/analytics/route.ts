import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      verifiedPartners,
      activeListings,
      totalPayments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BUSINESS', status: 'Approved' } }),
      prisma.item.count({ where: { isAvailable: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      })
    ]);

    const totalGMV = totalPayments._sum.amount || 0;
    const platformRevenue = totalGMV * 0.085; // Example 8.5% take rate

    const analytics = {
      totalUsers,
      verifiedPartners,
      activeListings,
      totalGMV,
      platformRevenue
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('GET Admin Analytics Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch analytics' } },
      { status: 500 }
    );
  }
}
