import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/analytics
 * Returns real database-driven analytics metrics.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to view analytics.' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
    }

    const totalUsers = await prisma.user.count();
    const totalItems = await prisma.item.count();
    const totalRequests = await prisma.borrowRequest.count();
    const completedRequests = await prisma.borrowRequest.count({ where: { status: 'RETURNED' } });
    const pendingVerifications = await prisma.businessVerification.count({ where: { status: 'PENDING' } });
    const totalPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });

    const userItems = await prisma.item.count({ where: { ownerId: user.id } });
    const userActiveBorrows = await prisma.borrowRequest.count({
      where: { borrowerId: user.id, status: 'ACCEPTED' },
    });

    return NextResponse.json({
      analytics: {
        totalUsers,
        totalItems,
        totalRequests,
        completedRequests,
        pendingVerifications,
        totalRevenue: totalPayments._sum.amount || 0,
        userMetrics: {
          myItemsCount: userItems,
          activeBorrowsCount: userActiveBorrows,
        },
      },
    });
  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch analytics.' } },
      { status: 500 }
    );
  }
}
