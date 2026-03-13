-- ============================================================
-- Equifax Onboarding Data — Full Schema Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Section 2: Company Information
ALTER TABLE equifax_onboarding_data
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS company_phone TEXT,
  ADD COLUMN IF NOT EXISTS company_website TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS years_in_business TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS geographic_area TEXT,
  ADD COLUMN IF NOT EXISTS account_types TEXT[],
  ADD COLUMN IF NOT EXISTS reason_for_reporting TEXT,
  ADD COLUMN IF NOT EXISTS other_bureaus TEXT[],
  ADD COLUMN IF NOT EXISTS data_upload_method TEXT,
  ADD COLUMN IF NOT EXISTS third_party_vendor TEXT,
  ADD COLUMN IF NOT EXISTS existing_member_numbers TEXT,
  ADD COLUMN IF NOT EXISTS lending_license_number TEXT;

-- Section 3: Business Model
ALTER TABLE equifax_onboarding_data
  ADD COLUMN IF NOT EXISTS customer_acquisition_method TEXT,
  ADD COLUMN IF NOT EXISTS has_dispute_procedures BOOLEAN,
  ADD COLUMN IF NOT EXISTS dispute_resolution_description TEXT;

-- Section 4: Product & Service
ALTER TABLE equifax_onboarding_data
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS repayment_terms TEXT,
  ADD COLUMN IF NOT EXISTS duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS loan_amount_min NUMERIC,
  ADD COLUMN IF NOT EXISTS loan_amount_max NUMERIC,
  ADD COLUMN IF NOT EXISTS collateral_description TEXT,
  ADD COLUMN IF NOT EXISTS has_membership_fees BOOLEAN,
  ADD COLUMN IF NOT EXISTS estimated_initial_records INTEGER,
  ADD COLUMN IF NOT EXISTS growth_12_months INTEGER,
  ADD COLUMN IF NOT EXISTS growth_24_months INTEGER;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
