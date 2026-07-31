import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const whereClause: any = {
      isAvailable: true,
      source: 'ONLINE', // Strictly fetch ONLINE items only
    };

    if (category && category !== 'All') {
      whereClause.category = category.toUpperCase();
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        pricePerDay: true,
        source: true,
        platformName: true,
        timesBorrowed: true,
        isAvailable: true,
        iconName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('GET Online Items Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch online items' } },
      { status: 500 }
    );
  }
}
