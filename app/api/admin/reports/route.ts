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

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Admin Reports GET Error:', error);
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
    
    const updated = await prisma.report.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin Reports PATCH Error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
}
