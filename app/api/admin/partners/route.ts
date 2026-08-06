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

    const partners = await prisma.partnerProfile.findMany({
      include: {
        user: { select: { email: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Admin Partners GET Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 403 });
    }

    const { id, status } = await req.json();
    
    // In our schema, PartnerProfile doesn't have a status, the User does (or BusinessVerification)
    // For this context, assuming we update the user's partnerStatus
    const partner = await prisma.partnerProfile.findUnique({ where: { id } });
    if (!partner) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });

    await prisma.user.update({
      where: { id: partner.userId },
      data: { partnerStatus: status }
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Admin Partners PATCH Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}
