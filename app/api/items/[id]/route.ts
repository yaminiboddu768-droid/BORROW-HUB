import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, averageRating: true } }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('GET Item by ID Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch item' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const existingItem = await prisma.item.findUnique({ where: { id } });

    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    if (existingItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this item' } },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.marketPrice !== undefined) updateData.marketPrice = typeof body.marketPrice === 'number' ? body.marketPrice : parseFloat(body.marketPrice) || null;
    if (body.pricePerDay !== undefined) updateData.pricePerDay = typeof body.pricePerDay === 'number' ? body.pricePerDay : parseFloat(body.pricePerDay);
    if (body.pricePerHour !== undefined) updateData.pricePerHour = typeof body.pricePerHour === 'number' ? body.pricePerHour : parseFloat(body.pricePerHour) || null;
    if (body.securityDeposit !== undefined) updateData.securityDeposit = typeof body.securityDeposit === 'number' ? body.securityDeposit : parseFloat(body.securityDeposit) || null;
    if (body.penaltyPerDay !== undefined) updateData.penaltyPerDay = typeof body.penaltyPerDay === 'number' ? body.penaltyPerDay : parseFloat(body.penaltyPerDay) || null;
    if (body.penaltyPerHour !== undefined) updateData.penaltyPerHour = typeof body.penaltyPerHour === 'number' ? body.penaltyPerHour : parseFloat(body.penaltyPerHour) || null;
    if (body.isAvailable !== undefined) updateData.isAvailable = Boolean(body.isAvailable);
    if (body.availabilityStatus !== undefined) updateData.isAvailable = body.availabilityStatus === 'Available';
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.imageUrls !== undefined) updateData.imageUrls = typeof body.imageUrls === 'string' ? body.imageUrls : JSON.stringify(body.imageUrls);

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('PATCH Item Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update item' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existingItem = await prisma.item.findUnique({ where: { id } });

    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    if (existingItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this item' } },
        { status: 403 }
      );
    }

    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('DELETE Item Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete item' } },
      { status: 500 }
    );
  }
}

