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

    const kyc = await prisma.businessVerification.findMany({
      include: {
        user: { select: { email: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(kyc);
  } catch (error) {
    console.error('Admin KYC GET Error:', error);
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
    
    const updated = await prisma.businessVerification.update({
      where: { id },
      data: { 
        status, 
        verifiedAt: status === 'APPROVED' ? new Date() : null 
      }
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { role: 'BUSINESS', partnerStatus: 'APPROVED' }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin KYC PATCH Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}
