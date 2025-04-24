ALTER TABLE offramp_requests
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

alter table offramp_requests
add column fiat_disbursement_status text check (fiat_disbursement_status in ('pending', 'success', 'failed')) default 'pending';

alter table offramp_requests
add column disbursed_at timestamp;

alter table offramp_requests
add column payout_reference text;

alter table offramp_requests
add column admin_note text;


ALTER TABLE offramp_requests
ADD COLUMN fiat_amount NUMERIC NOT NULL,
ADD COLUMN bank_account_number TEXT NOT NULL,
ADD COLUMN bank_code TEXT NOT NULL;

