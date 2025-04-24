// utils/solana.ts
import {
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    ParsedConfirmedTransaction,
  } from "@solana/web3.js";
  
  const RPC_URL = "https://api.mainnet-beta.solana.com"; // or use a private RPC
  const connection = new Connection(RPC_URL, "confirmed");
  
  export async function checkSolPayment({
    userWallet,
    toWallet,
    amountSol,
  }: {
    userWallet: string;
    toWallet: string;
    amountSol: number;
  }): Promise<boolean> {
    const sigs = await connection.getConfirmedSignaturesForAddress2(
      new PublicKey(userWallet),
      { limit: 10 }
    );
  
    for (const sig of sigs) {
      const tx = await connection.getParsedConfirmedTransaction(sig.signature);
  
      const isMatch = isSolTransferToWallet(tx, userWallet, toWallet, amountSol);
      if (isMatch) return true;
    }
  
    return false;
  }
  
  function isSolTransferToWallet(
    tx: ParsedConfirmedTransaction | null,
    from: string,
    to: string,
    amountSol: number
  ): boolean {
    if (!tx || !tx.meta || !tx.transaction.message.instructions) return false;
  
    for (const ix of tx.transaction.message.instructions) {
      if (
        "parsed" in ix &&
        ix.program === "system" &&
        ix.parsed?.type === "transfer"
      ) {
        const { source, destination, lamports } = ix.parsed.info;
        if (
          source === from &&
          destination === to &&
          lamports === amountSol * LAMPORTS_PER_SOL
        ) {
          return true;
        }
      }
    }
  
    return false;
  }
  