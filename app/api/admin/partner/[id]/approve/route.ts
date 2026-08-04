import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: partnerId } = await props.params;

    // Find the partner profile to get the user ID
    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { id: partnerId },
    });

    if (!partnerProfile) {
      return NextResponse.json(
        { error: 'Partner profile not found.' },
        { status: 404 }
      );
    }

    // Approve the partner
    const updatedUser = await prisma.user.update({
      where: { id: partnerProfile.userId },
      data: {
        partnerStatus: 'approved',
      },
    });

    return NextResponse.json({
      message: 'Partner approved successfully.',
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        partnerStatus: updatedUser.partnerStatus,
      },
    });
  } catch (error) {
    console.error('Error approving partner:', error);
    return NextResponse.json(
      { error: 'Internal server error during approval.' },
      { status: 500 }
    );
  }
}
