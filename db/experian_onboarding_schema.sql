-- ============================================================
-- Experian Commercial Data Onboarding — Full Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Applications table
CREATE TABLE IF NOT EXISTS experian_onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    requirement_tag TEXT DEFAULT 'EXPERIAN_MEMBERSHIP_APP',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Data table — bureau-specific fields only
--    (shared company fields come from organizations + profiles)
CREATE TABLE IF NOT EXISTS experian_onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES experian_onboarding_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Step 2: Company Identity
    dba_name TEXT,
    years_in_business TEXT,
    ownership_type TEXT,         -- Sole Prop, Corporation, LLC, Partnership, etc.
    tax_id TEXT,
    state_of_incorporation TEXT,

    -- Step 3: Physical Location
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lease_or_own TEXT,           -- 'lease' | 'own'
    how_long_at_location TEXT,

    -- Residential address check (Experian-specific)
    residential_address_check BOOLEAN DEFAULT FALSE,
    residential_address_note TEXT,

    -- Step 4: Affiliated / Parent Company
    has_parent_company BOOLEAN DEFAULT FALSE,
    parent_company_name TEXT,
    parent_company_address TEXT,
    parent_company_equifax_id TEXT,
    parent_company_experian_id TEXT,
    affiliated_companies TEXT,

    -- Step 5: Authorization
    authorized_signer_name TEXT,
    authorized_signer_title TEXT,
    authorized_signer_email TEXT,
    signature_date DATE,
    agreed_to_terms BOOLEAN DEFAULT FALSE
);

-- 3. RLS
ALTER TABLE experian_onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experian_onboarding_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org access experian applications" ON experian_onboarding_applications;
CREATE POLICY "Org access experian applications"
  ON experian_onboarding_applications FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Org access experian data" ON experian_onboarding_data;
CREATE POLICY "Org access experian data"
  ON experian_onboarding_data FOR ALL
  USING (
    application_id IN (
      SELECT eoa.id FROM experian_onboarding_applications eoa
      JOIN profiles p ON p.org_id = eoa.org_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    application_id IN (
      SELECT eoa.id FROM experian_onboarding_applications eoa
      JOIN profiles p ON p.org_id = eoa.org_id
      WHERE p.id = auth.uid()
    )
  );

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
