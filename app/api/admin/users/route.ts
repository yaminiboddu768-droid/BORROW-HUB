import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        averageRating: true,
        locationText: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET Admin Users Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status) {
       return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Missing parameters' } }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PATCH Admin Users Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update user' } },
      { status: 500 }
    );
  }
}
