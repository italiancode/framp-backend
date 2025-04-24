INSERT INTO public.offramp_requests (
  id, 
  user_id, 
  wallet, 
  token, 
  amount, 
  fiat_amount, 
  bank_name, 
  bank_account_number, 
  bank_code, 
  status, 
  created_at, 
  fiat_disbursement_status, 
  disbursed_at, 
  payout_reference, 
  admin_note
)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222', 
    '11111111-1111-1111-1111-111111111111', 
    'dummy_wallet_001', 
    'SOL', 
    5000, 
    5000, 
    'Dummy Bank', 
    '1234567890', 
    '011', 
    'pending', 
    '2025-04-24 17:30:00+00', 
    'pending', 
    NULL, 
    NULL, 
    'Dummy offramp request'
  );
