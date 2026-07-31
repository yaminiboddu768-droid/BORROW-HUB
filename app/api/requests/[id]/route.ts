import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { updateRequestStatusSchema } from '@/lib/validations';

type ValidTransitions = {
  [key: string]: string[];
};

const OWNER_TRANSITIONS: ValidTransitions = {
  REQUESTED: ['ACCEPTED', 'DECLINED'],
};

const BORROWER_TRANSITIONS: ValidTransitions = {
  ACCEPTED: ['PICKED_UP'],
  PICKED_UP: ['RETURNED'],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateRequestStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: result.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { status: newStatus } = result.data;

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: { item: { select: { ownerId: true } } }
    });

    if (!borrowRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Borrow request not found' } },
        { status: 404 }
      );
    }

    const isOwner = borrowRequest.item.ownerId === session.user.id;
    const isBorrower = borrowRequest.borrowerId === session.user.id;
    const currentStatus = borrowRequest.status;

    if (isOwner) {
      const allowedForOwner = OWNER_TRANSITIONS[currentStatus] || [];
      if (!allowedForOwner.includes(newStatus)) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: `Owner cannot transition from ${currentStatus} to ${newStatus}` } },
          { status: 403 }
        );
      }
    } else if (isBorrower) {
      const allowedForBorrower = BORROWER_TRANSITIONS[currentStatus] || [];
      if (!allowedForBorrower.includes(newStatus)) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: `Borrower cannot transition from ${currentStatus} to ${newStatus}` } },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You are not authorized to update this request' } },
        { status: 403 }
      );
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      let penaltyAmount = null;

      if (newStatus === 'RETURNED' && borrowRequest.endDate) {
        const now = new Date();
        const endDate = new Date(borrowRequest.endDate);
        
        if (now > endDate) {
          const item = await tx.item.findUnique({ where: { id: borrowRequest.itemId } });
          if (item) {
            const msLate = now.getTime() - endDate.getTime();
            const hoursLate = Math.ceil(msLate / (1000 * 60 * 60));
            const daysLate = Math.ceil(hoursLate / 24);

            if (daysLate >= 1 && item.penaltyPerDay) {
              penaltyAmount = daysLate * item.penaltyPerDay;
            } else if (hoursLate > 0 && item.penaltyPerHour) {
              penaltyAmount = hoursLate * item.penaltyPerHour;
            }
          }
        }
      }

      const updated = await tx.borrowRequest.update({
        where: { id },
        data: { 
          status: newStatus,
          ...(penaltyAmount !== null ? { penaltyAmount } : {})
        },
        include: {
          item: { include: { owner: { select: { name: true } } } },
          borrower: { select: { name: true } }
        }
      });

      if (newStatus === 'RETURNED') {
        await tx.item.update({
          where: { id: borrowRequest.itemId },
          data: { timesBorrowed: { increment: 1 } }
        });
      }

      return updated;
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('PATCH BorrowRequest Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update request status' } },
      { status: 500 }
    );
  }
}
