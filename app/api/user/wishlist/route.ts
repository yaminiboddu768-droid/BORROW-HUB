import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        item: {
          include: { owner: { select: { name: true } } }
        }
      }
    });

    return NextResponse.json(wishlists.map(w => w.item));
  } catch (error) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'itemId required' } }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_itemId: { userId: session.user.id, itemId } }
    });

    if (existing) {
      // Toggle off if already exists
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed' });
    } else {
      // Toggle on
      await prisma.wishlist.create({
        data: { userId: session.user.id, itemId }
      });
      return NextResponse.json({ action: 'added' });
    }
  } catch (error) {
    console.error('Wishlist POST Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}
