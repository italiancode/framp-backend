export async function initiateFlutterwaveTransfer({
  amount,
  account_number,
  bank_code,
  currency,
  narration,
}: {
  amount: number;
  account_number: string;
  bank_code: string;
  currency: string;
  narration: string;
}) {
  const FLW_SECRET = process.env.FLW_SECRET_KEY!;
  const url = "https://api.flutterwave.com/v3/transfers";

  const payload = {
    account_bank: bank_code,
    account_number,
    amount,
    currency,
    narration,
    callback_url: "https://framp.app/api/transfer-callback",
    debit_currency: currency,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (data.status === "success") {
    return {
      status: "success",
      reference: data.data?.reference,
    };
  } else {
    throw new Error(data.message || "Transfer failed");
  }
}
