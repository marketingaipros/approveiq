-- ============================================================
-- D&B (Dun & Bradstreet) Onboarding Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS dnb_onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    intent TEXT,  -- 'building_credit' | 'reporting_customers'
    requirement_tags TEXT[] DEFAULT ARRAY['DNB_ELIGIBILITY', 'LENDER_VERIFICATION'],
    ai_flags JSONB DEFAULT '[]',  -- AI auditor flags (PO Box, non-B2B, sole prop, etc.)
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dnb_onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES dnb_onboarding_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Step 2: Company Identity (populated from org, verified by applicant)
    legal_entity_type TEXT,           -- LLC, Corporation, etc.
    ein TEXT,
    duns_number TEXT,                 -- Existing DUNS if known
    business_phone TEXT,
    business_phone_type TEXT,         -- 'landline' | 'voip' | 'cell'
    business_address TEXT,
    business_city TEXT,
    business_state TEXT,
    business_zip TEXT,
    address_type TEXT,                -- 'commercial' | 'residential' | 'po_box'
    address_ai_flag TEXT,             -- AI auditor flag: 'po_box_blocked' | 'residential_high_risk' | null

    -- Step 3: Intent
    intent TEXT,                      -- 'building_credit' | 'reporting_customers'

    -- Step 4A: Reporting on Customers
    customer_accounts JSONB DEFAULT '[]',   -- Array of {duns, high_credit, balance, past_due, terms, status, ai_flag}

    -- Step 4B: Building Credit — Trade References
    trade_references JSONB DEFAULT '[]',    -- Array of {vendor_name, contact_name, phone, email, credit_limit, account_type, ai_flag}

    -- Step 5: Authorization
    authorized_signer_name TEXT,
    authorized_signer_title TEXT,
    authorized_signer_email TEXT,
    signature_date DATE,
    agreed_to_terms BOOLEAN DEFAULT FALSE
);

-- RLS
ALTER TABLE dnb_onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dnb_onboarding_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org access dnb applications" ON dnb_onboarding_applications;
CREATE POLICY "Org access dnb applications"
  ON dnb_onboarding_applications FOR ALL
  USING (org_id IN (SELECT id FROM organizations));

DROP POLICY IF EXISTS "Org access dnb data" ON dnb_onboarding_data;
CREATE POLICY "Org access dnb data"
  ON dnb_onboarding_data FOR ALL
  USING (
    application_id IN (
      SELECT d.id FROM dnb_onboarding_applications d
      JOIN (SELECT id FROM organizations) o ON o.id = d.org_id
    )
  );

NOTIFY pgrst, 'reload schema';
