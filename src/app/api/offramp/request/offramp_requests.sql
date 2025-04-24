create table public.offramp_requests (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  wallet text not null,
  token text not null,
  amount numeric not null,
  fiat_amount numeric not null,
  bank_name text not null,
  bank_account_number text not null,
  bank_code text not null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  fiat_disbursement_status text null default 'pending'::text,
  disbursed_at timestamp without time zone null,
  payout_reference text null,
  admin_note text null,
  
  constraint offramp_requests_pkey primary key (id),
  constraint offramp_requests_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint offramp_requests_fiat_disbursement_status_check check (
    (
      fiat_disbursement_status = any (
        array['pending'::text, 'disbursed'::text, 'failed'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_offramp_wallet on public.offramp_requests using btree (wallet) TABLESPACE pg_default;