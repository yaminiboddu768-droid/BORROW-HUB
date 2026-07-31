import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { borrowRequestSchema } from '@/lib/validations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to request an item' } },
        { status: 401 }
      );
    }

    const body = await req.json();

    const result = borrowRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: result.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { itemId, startDate, endDate, estimatedCost } = result.data;

    // Verify item exists
    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!item) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    // Business Rule: Cannot borrow your own item
    if (item.ownerId === session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You cannot borrow your own item' } },
        { status: 403 }
      );
    }

    // Business Rule: Item must be available
    if (!item.isAvailable) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'This item is currently unavailable' } },
        { status: 409 }
      );
    }

    // ONLINE items skip approval — go straight to ACCEPTED
    const initialStatus = item.source === 'ONLINE' ? 'ACCEPTED' : 'REQUESTED';

    const newRequest = await prisma.borrowRequest.create({
      data: {
        itemId,
        borrowerId: session.user.id,
        status: initialStatus,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        estimatedCost,
      },
      include: {
        item: { include: { owner: { select: { name: true } } } },
        borrower: { select: { name: true } },
      }
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('POST BorrowRequest Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create borrow request' } },
      { status: 500 }
    );
  }
}
