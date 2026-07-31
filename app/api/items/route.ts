import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { itemSchema } from '@/lib/validations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { validateAndCleanListings } from '@/lib/format';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    const whereClause: any = { isAvailable: true };

    if (category && category !== 'All') {
      whereClause.category = category.toUpperCase();
    }
    
    if (source) {
      whereClause.source = source.toUpperCase();
    }

    if (search) {
      whereClause.name = {
        contains: search,
      }; // Note: SQLite doesn't support case-insensitive `contains` by default without setup, so this is exact or lowercase match based on collation, but works for mock testing.
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { name: true, averageRating: true }
        }
      },
      orderBy: {
        distanceKm: 'asc' // Sort by distance ascending as requested
      }
    });

    const cleanedItems = validateAndCleanListings(items);
    return NextResponse.json(cleanedItems);
  } catch (error) {
    console.error('GET Items Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch items' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to list an item' } },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body using Zod
    const result = itemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: result.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { name, category, description, marketPrice, pricePerHour, pricePerDay, penaltyPerHour, penaltyPerDay, source, platformName, distanceKm, imageUrl, imageUrls } = result.data;

    const newItem = await prisma.item.create({
      data: {
        name,
        category,
        description,
        marketPrice,
        pricePerHour,
        pricePerDay,
        penaltyPerHour,
        penaltyPerDay,
        source,
        platformName,
        distanceKm: distanceKm ?? 1.5, // Default distance if none provided
        ownerId: session.user.id, // Securely derive owner from session
        iconName: category === 'TOOLS' ? 'Wrench' : category === 'ELECTRONICS' ? 'Tv' : 'Sparkles', // Simple mock icon logic
        imageUrl,
        imageUrls: imageUrls ?? "[]",
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST Item Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create item' } },
      { status: 500 }
    );
  }
}
