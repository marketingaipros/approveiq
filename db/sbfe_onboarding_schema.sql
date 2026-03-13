-- ============================================================
-- SBFE (Small Business Financial Exchange) Onboarding Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Applications table
CREATE TABLE IF NOT EXISTS sbfe_onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    requirement_tags TEXT[] DEFAULT ARRAY['LENDER_VERIFICATION', 'SBFE_GOVERNANCE'],
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Data table — SBFE-specific fields only
CREATE TABLE IF NOT EXISTS sbfe_onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES sbfe_onboarding_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Step 2: Company Identity (Experian-parallel fields for SBFE)
    dba_name TEXT,
    years_in_business TEXT,
    ownership_type TEXT,
    tax_id TEXT,
    state_of_incorporation TEXT,

    -- Step 3: SBFE-Specific Questionnaire
    primary_reason_for_joining TEXT,   -- New field per user request
    is_small_business_originator BOOLEAN,
    does_trade_credit BOOLEAN,
    annual_account_volume TEXT,        -- Used for dues tier calculation
    data_use_certification BOOLEAN,    -- Confirms data use restricted to credit/risk
    existing_sbfe_member BOOLEAN,
    existing_member_number TEXT,
    other_bureaus_reporting TEXT[],
    data_transmission_method TEXT,     -- SFTP or 3rd party
    third_party_processor_name TEXT,

    -- Step 4: Authorized Signature
    authorized_signer_name TEXT,
    authorized_signer_title TEXT,
    authorized_signer_email TEXT,
    signature_date DATE,
    agreed_to_terms BOOLEAN DEFAULT FALSE
);

-- 3. RLS
ALTER TABLE sbfe_onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbfe_onboarding_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org access sbfe applications" ON sbfe_onboarding_applications;
CREATE POLICY "Org access sbfe applications"
  ON sbfe_onboarding_applications FOR ALL
  USING (org_id IN (
    SELECT id FROM organizations
  ));

DROP POLICY IF EXISTS "Org access sbfe data" ON sbfe_onboarding_data;
CREATE POLICY "Org access sbfe data"
  ON sbfe_onboarding_data FOR ALL
  USING (
    application_id IN (
      SELECT s.id FROM sbfe_onboarding_applications s
      JOIN (SELECT id FROM organizations) o ON o.id = s.org_id
    )
  );

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
