import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

async function checkPartnerAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  const user = session.user as any;
  if (user.role !== 'partner' || user.partnerStatus !== 'approved') return null;
  return user.id;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerId = await checkPartnerAuth();
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    // Verify ownership
    const existingProduct = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existingProduct.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedProduct = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        pricePerDay: data.pricePerDay ? parseFloat(data.pricePerDay) : undefined,
        pricePerHour: data.pricePerHour ? parseFloat(data.pricePerHour) : null,
        marketPrice: data.marketPrice ? parseFloat(data.marketPrice) : null,
        securityDeposit: data.securityDeposit ? parseFloat(data.securityDeposit) : null,
        brand: data.brand,
        model: data.model,
        condition: data.condition,
        damagePolicy: data.damagePolicy,
        quantity: data.quantity ? parseInt(data.quantity) : undefined,
        deliveryType: data.deliveryType,
        isAvailable: data.isAvailable,
        imageUrls: data.images ? JSON.stringify(data.images) : undefined,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : undefined,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerId = await checkPartnerAuth();
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existingProduct = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existingProduct.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
