import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;
    if (user.role !== 'partner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const profile = await prisma.partnerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching partner profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;
    if (user.role !== 'partner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();

    const updatedProfile = await prisma.partnerProfile.update({
      where: { userId: user.id },
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        address: data.address,
        gstNumber: data.gstNumber,
        logoUrl: data.logoUrl,
        aadhaarUrl: data.aadhaarUrl,
        panUrl: data.panUrl,
        shopLicenseUrl: data.shopLicenseUrl,
        bankAccount: data.bankAccount,
        upiId: data.upiId,
        rentalPolicy: data.rentalPolicy,
        damagePolicy: data.damagePolicy,
        returnPolicy: data.returnPolicy,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating partner profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
