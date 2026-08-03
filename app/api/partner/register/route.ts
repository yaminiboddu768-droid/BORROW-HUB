import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      businessName,
      logoUrl,
      ownerName,
      address,
      gstNumber,
      aadhaarUrl,
      panUrl,
      shopLicenseUrl,
      bankAccount,
      upiId,
      rentalPolicy,
      damagePolicy,
      returnPolicy,
    } = body;

    if (!email || !password || !businessName || !ownerName || !address) {
      return NextResponse.json(
        { error: 'Email, Password, Business Name, Owner Name, and Address are required.' },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: emailClean } });
    if (user) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const namePart = emailClean.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    user = await prisma.user.create({
      data: {
        email: emailClean,
        name: formattedName,
        passwordHash,
        averageRating: 5.0,
        role: 'partner',
        partnerStatus: 'approved',
      },
    });

    const userId = user.id;

    // Upsert the partner profile
    const partnerProfile = await prisma.partnerProfile.upsert({
      where: { userId },
      update: {
        businessName,
        logoUrl,
        ownerName,
        address,
        gstNumber,
        aadhaarUrl,
        panUrl,
        shopLicenseUrl,
        bankAccount,
        upiId,
        rentalPolicy,
        damagePolicy,
        returnPolicy,
      },
      create: {
        userId,
        businessName,
        logoUrl,
        ownerName,
        address,
        gstNumber,
        aadhaarUrl,
        panUrl,
        shopLicenseUrl,
        bankAccount,
        upiId,
        rentalPolicy,
        damagePolicy,
        returnPolicy,
      },
    });

    return NextResponse.json({
      message: 'Registration successful.',
      profile: partnerProfile,
      user: {
        role: user.role,
        partnerStatus: user.partnerStatus,
      },
    });
  } catch (error) {
    console.error('Error in partner registration:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
