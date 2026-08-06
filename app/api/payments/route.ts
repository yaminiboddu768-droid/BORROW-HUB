import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to process payments.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { requestId, amount, action = 'create_order', razorpayPaymentId, razorpaySignature } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Request ID is required.' } },
        { status: 400 }
      );
    }

    // Initialize Razorpay SDK
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Payment gateway is not configured.' } },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    if (action === 'create_order') {
      if (!amount) {
         return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Amount is required for creating an order.' } },
          { status: 400 }
        );
      }
      
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${requestId}`,
      };
      
      const order = await instance.orders.create(options);
      
      const payment = await prisma.payment.upsert({
        where: { requestId },
        update: {
          amount: amount,
          razorpayOrderId: order.id,
          status: 'PENDING',
        },
        create: {
          requestId,
          amount: amount,
          razorpayOrderId: order.id,
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        payment,
        orderId: order.id,
        razorpayKey: razorpayKeyId,
      });
    }

    if (action === 'verify_payment') {
      const paymentRecord = await prisma.payment.findUnique({
        where: { requestId }
      });
      
      if (!paymentRecord || !paymentRecord.razorpayOrderId) {
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Order not found.' } },
          { status: 400 }
        );
      }
      
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(paymentRecord.razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
         return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Invalid payment signature.' } },
          { status: 400 }
        );
      }

      const payment = await prisma.payment.update({
        where: { requestId },
        data: {
          razorpayPaymentId: razorpayPaymentId,
          status: 'PAID',
        },
      });

      await prisma.borrowRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        payment,
      });
    }

    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid payment action.' } },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment Processing Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to process payment.' } },
      { status: 500 }
    );
  }
}
