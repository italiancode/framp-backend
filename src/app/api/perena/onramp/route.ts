import { NextResponse } from 'next/server';
import { processOnRamp } from '@/lib/perena/fiat-bridge';

export async function POST(req: Request) {
  try {
    // For demo purposes, we'll skip the authentication check
    // In a production app, implement proper auth checks

    // Parse the request body
    const data = await req.json();
    const { amount, userWallet, paymentMethod } = data;

    // Basic validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!userWallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Process the on-ramp request
    const result = await processOnRamp({
      amount,
      userWallet,
      paymentMethod,
      email: "user@example.com", // Mock email for demo
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-ramp API error:', error);
    return NextResponse.json(
      { error: 'Failed to process on-ramp request' },
      { status: 500 }
    );
  }
} 