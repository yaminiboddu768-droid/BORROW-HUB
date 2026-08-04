import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// Helper middleware function for role checking
async function checkPartnerAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  const user = session.user as any;
  return user.id;
}

export async function GET(req: Request) {
  try {
    const ownerId = await checkPartnerAuth();
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'All';

    let whereClause: any = { ownerId };
    
    if (filter === 'Active' || filter === 'Available') {
      whereClause.isAvailable = true;
      whereClause.quantity = { gt: 0 };
    } else if (filter === 'Out of Stock') {
      whereClause.quantity = 0;
    } else if (filter === 'Unavailable' || filter === 'Paused') {
      whereClause.isAvailable = false;
    } else if (filter === 'Currently Rented' || filter === 'Rented') {
      whereClause.availabilityStatus = 'Rented';
    } else if (filter === 'Reserved') {
      whereClause.availabilityStatus = 'Reserved';
    } else if (filter === 'Maintenance') {
      whereClause.availabilityStatus = 'Maintenance';
    }

    const products = await prisma.item.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { borrowRequests: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ownerId = await checkPartnerAuth();
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const imagesArray: string[] = Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []);

    const product = await prisma.item.create({
      data: {
        ownerId,
        name: data.name,
        category: data.category,
        description: data.description,
        pricePerDay: parseFloat(data.pricePerDay),
        pricePerHour: data.pricePerHour ? parseFloat(data.pricePerHour) : null,
        marketPrice: data.marketPrice ? parseFloat(data.marketPrice) : null,
        securityDeposit: data.securityDeposit ? parseFloat(data.securityDeposit) : null,
        source: 'ONLINE',
        platformName: data.brand ? `${data.brand} Partner` : 'Partner Store',
        brand: data.brand,
        model: data.model,
        condition: data.condition,
        damagePolicy: data.damagePolicy,
        quantity: parseInt(data.quantity) || 1,
        deliveryType: data.deliveryType,
        isAvailable: data.isAvailable !== false && data.availabilityStatus !== 'Unavailable' && data.availabilityStatus !== 'Maintenance' && data.availabilityStatus !== 'Paused',
        imageUrls: JSON.stringify(imagesArray),
        imageUrl: imagesArray.length > 0 ? imagesArray[0] : null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
