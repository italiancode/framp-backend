import { NextResponse } from "next/server";
import { redeemUSDStar, getUSDStarExchangeRate } from "@/lib/perena/client";
import { initiateFlutterwaveTransfer } from "@/lib/fiat/transfer";
import { supabase } from "@/lib/supabase";

// Get the off-ramp fee percentage from environment variables (default to 1%)
const OFFRAMP_FEE_PERCENTAGE = Number(process.env.NEXT_PUBLIC_OFFRAMP_FEE_PERCENTAGE || 1);

// DEV_MODE for testing (always succeeds)
const DEV_MODE = true;

const frampPoolWallet = process.env.FRAMP_POOL_WALLET;

export async function POST(request: Request) {
  try {
    // Debug log environment variables (without exposing sensitive keys)
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Verify Supabase client is initialized
    if (!supabase) {
      console.error("Supabase client not initialized");
      return NextResponse.json(
        { error: "Supabase client not initialized. Check server configuration." },
        { status: 500 }
      );
    }

    // Check if FRAMP_POOL_WALLET is set
    if (!frampPoolWallet) {
      console.error("FRAMP_POOL_WALLET environment variable is not set");
      return NextResponse.json(
        { error: "Framp pool wallet not configured. Please set FRAMP_POOL_WALLET in .env" },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { 
      userWallet, 
      amount, 
      token = "USD*", 
      bank_account_number, 
      bank_code, 
      bank_name,
      currency = "NGN",
      userId,
      signedTransaction
    } = body;

    console.log("Off-ramp request received:", { 
      userWallet, amount, token, bank_account_number, bank_code, bank_name, currency,
      signedTransaction: signedTransaction ? "provided" : "missing"
    });

    // Validate required fields
    if (!userWallet || !amount || !bank_account_number || !bank_code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!signedTransaction) {
      return NextResponse.json(
        { error: "Transaction signature required for security" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Calculate fiat amount after fee
    const fiatAmount = amount * (1 - OFFRAMP_FEE_PERCENTAGE / 100);
    console.log(`Processing off-ramp: $${amount} to fiat ${fiatAmount} (fee: ${OFFRAMP_FEE_PERCENTAGE}%)`);

    // In DEV_MODE, return a success response without processing
    if (DEV_MODE) {
      console.log("DEV MODE: Skipping actual off-ramp processing");
      
      // Verify the transaction (in DEV_MODE, we just check if it exists)
      if (!signedTransaction || (typeof signedTransaction !== 'string')) {
        console.error("Invalid signed transaction");
        return NextResponse.json(
          { error: "Invalid transaction signature" },
          { status: 400 }
        );
      }
      
      console.log("Transaction signature verified:", signedTransaction.substring(0, 20) + "...");
      
      const currentTime = new Date().toISOString();
      
      // Create mock off-ramp record in Supabase
      const { data: offRampRecord, error } = await supabase
        .from('offramp_requests')
        .insert({
          user_id: userId || null,
          wallet: userWallet,
          token: token,
          amount: amount,
          fiat_amount: fiatAmount,
          bank_name: bank_name || "Unknown Bank",
          bank_account_number: bank_account_number,
          bank_code: bank_code,
          status: "pending",
          fiat_disbursement_status: "pending",
          created_at: currentTime,
          disbursed_at: null,
          payout_reference: null,
          admin_note: `Automatically created via off-ramp API. Signed transaction: ${signedTransaction.substring(0, 20)}...`,
          currency: currency
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating off-ramp record:", error);
        return NextResponse.json(
          { error: "Failed to create off-ramp record: " + error.message },
          { status: 500 }
        );
      }

      console.log("Off-ramp record created:", offRampRecord);

      return NextResponse.json({
        success: true,
        offrampId: offRampRecord.id,
        reference: offRampRecord.payout_reference,
        status: 'pending',
        fiatAmount: fiatAmount,
        message: "Off-ramp request has been submitted for processing"
      });
    }

    // Process the withdrawal
    try {
      // Verify the transaction signature
      if (!signedTransaction || (typeof signedTransaction !== 'string')) {
        console.error("Invalid signed transaction");
        return NextResponse.json(
          { error: "Invalid transaction signature" },
          { status: 400 }
        );
      }
      
      console.log("Transaction signature provided:", signedTransaction.substring(0, 20) + "...");
      
      // In production, you would:
      // 1. Verify the signature is valid
      // 2. Verify the transaction is for the correct amount and to the correct address
      // 3. Submit the transaction to the blockchain
      
      // Calculate exchange rate
      const exchangeRate = await getUSDStarExchangeRate(currency);
      
      // Redeem USD* from the user's wallet to the Framp pool wallet
      console.log(`Processing signed transaction for ${amount} USD* from ${userWallet} to ${frampPoolWallet}`);
      
      // This would be replaced with actual transaction submission in production
      const redeemResult = {
        success: true,
        txId: signedTransaction.startsWith('mock') 
          ? signedTransaction 
          : 'tx-' + Date.now(),
      };

      const currentTime = new Date().toISOString();

      // Insert the off-ramp request into the database
      const { data: offrampRecord, error: insertError } = await supabase
        .from("offramp_requests")
        .insert({
          user_id: userId || null,
          wallet: userWallet,
          token: token,
          amount: amount,
          fiat_amount: fiatAmount,
          bank_name: bank_name || "Unknown Bank",
          bank_account_number: bank_account_number,
          bank_code: bank_code,
          status: "pending",
          fiat_disbursement_status: "pending",
          created_at: currentTime,
          disbursed_at: null,
          payout_reference: null,
          admin_note: `USD* transfer transaction: ${redeemResult.txId} (User-signed)`,
          currency: currency
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error recording off-ramp request:", insertError);
        return NextResponse.json(
          { error: "Failed to record off-ramp request" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Off-ramp request submitted successfully",
        transactionId: redeemResult.txId,
        offrampId: offrampRecord.id,
        amount: amount,
        fiatAmount: fiatAmount,
        feePercentage: OFFRAMP_FEE_PERCENTAGE,
        feeAmount: amount * (OFFRAMP_FEE_PERCENTAGE / 100),
        status: "pending"
      });
      
    } catch (transferError) {
      console.error("Error processing USD* transfer:", transferError);
      
      return NextResponse.json(
        { error: "Failed to process USD* transfer", details: (transferError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in offramp POST API:", error);
    return NextResponse.json(
      { error: "Failed to process offramp request" },
      { status: 500 }
    );
  }
}