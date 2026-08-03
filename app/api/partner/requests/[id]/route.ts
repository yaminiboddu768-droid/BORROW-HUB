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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerId = await checkPartnerAuth();
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { action, damageCheck } = data; // action can be 'accept', 'reject', 'verify-return'

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!borrowRequest) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (borrowRequest.item.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let newStatus = borrowRequest.status;
    let penaltyAmount = borrowRequest.penaltyAmount;

    if (action === 'accept' && borrowRequest.status === 'pending') {
      newStatus = 'approved';
    } else if (action === 'reject' && borrowRequest.status === 'pending') {
      newStatus = 'cancelled';
    } else if (action === 'verify-return' && borrowRequest.status === 'return_requested') {
      newStatus = 'completed';
      
      // Basic mock of a damage check penalty
      if (damageCheck === 'major') penaltyAmount = (penaltyAmount || 0) + 1000;
      if (damageCheck === 'minor') penaltyAmount = (penaltyAmount || 0) + 200;
      
    } else {
      return NextResponse.json({ error: 'Invalid action for current status' }, { status: 400 });
    }

    const updatedRequest = await prisma.borrowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        penaltyAmount,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
