import { NextResponse } from 'next/server';
import { processOffRamp } from '@/lib/perena/fiat-bridge';

export async function POST(req: Request) {
  try {
    // For demo purposes, we'll skip the authentication check
    // In a production app, implement proper auth checks

    // Parse the request body
    const data = await req.json();
    const { amount, userWallet, accountNumber, bankCode, currency } = data;

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

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: 'Bank details are required' },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      );
    }

    // Process the off-ramp request
    const result = await processOffRamp({
      amount,
      userWallet,
      accountNumber,
      bankCode,
      currency,
      email: "user@example.com", // Mock email for demo
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Off-ramp API error:', error);
    return NextResponse.json(
      { error: 'Failed to process off-ramp request' },
      { status: 500 }
    );
  }
} 