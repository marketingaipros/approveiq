-- ============================================================
-- Equifax Onboarding — Full Schema (Create + Migrate)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Base Applications Table
CREATE TABLE IF NOT EXISTS equifax_onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    equifax_member_number TEXT,
    transmission_type TEXT,
    transmission_setup_completed BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Base Data Table
CREATE TABLE IF NOT EXISTS equifax_onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES equifax_onboarding_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Legacy completion flags (keep for backward compat)
    company_name_completed BOOLEAN DEFAULT FALSE,
    company_address_completed BOOLEAN DEFAULT FALSE,
    company_phone_completed BOOLEAN DEFAULT FALSE,
    company_website_completed BOOLEAN DEFAULT FALSE,
    industry_completed BOOLEAN DEFAULT FALSE,
    repayment_terms_completed BOOLEAN DEFAULT FALSE,
    loan_ranges_completed BOOLEAN DEFAULT FALSE,
    estimated_records_completed BOOLEAN DEFAULT FALSE,
    dispute_procedures_completed BOOLEAN DEFAULT FALSE,
    lending_license_completed BOOLEAN DEFAULT FALSE
);

-- 3. Section 2: Company Information
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

-- 4. Section 3: Business Model
ALTER TABLE equifax_onboarding_data
  ADD COLUMN IF NOT EXISTS customer_acquisition_method TEXT,
  ADD COLUMN IF NOT EXISTS has_dispute_procedures BOOLEAN,
  ADD COLUMN IF NOT EXISTS dispute_resolution_description TEXT;

-- 5. Section 4: Product & Service
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

-- 6. Enable RLS
ALTER TABLE equifax_onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE equifax_onboarding_data ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (org-scoped access)
DROP POLICY IF EXISTS "Users access own org applications" ON equifax_onboarding_applications;
CREATE POLICY "Users access own org applications"
  ON equifax_onboarding_applications
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users access own org data" ON equifax_onboarding_data;
CREATE POLICY "Users access own org data"
  ON equifax_onboarding_data
  FOR ALL USING (
    application_id IN (
      SELECT eoa.id FROM equifax_onboarding_applications eoa
      JOIN profiles p ON p.org_id = eoa.org_id
      WHERE p.id = auth.uid()
    )
  );

-- 8. Reload schema cache
NOTIFY pgrst, 'reload schema';
