import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { logActivity } from '@/lib/auditLogger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 403 });
    }

    const listings = await prisma.item.findMany({
      where: { isDeleted: false },
      include: {
        owner: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Admin Listings GET Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: { code: 'BAD_REQUEST' } }, { status: 400 });

    await prisma.item.update({ 
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    await logActivity({
      userId: session.user.id,
      role: (session.user as any).role,
      action: 'ADMIN_DELETE_ITEM',
      details: `Soft deleted item ${id}`,
      req
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Listings DELETE Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}
