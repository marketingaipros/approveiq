-- ==============================================================================
-- EQUIFAX DATA CONTRIBUTOR ONBOARDING SCHEMA
-- ==============================================================================

-- 1. EQUIFAX_ONBOARDING_APPLICATIONS
-- Tracks the high-level application status and logic for a specific organization
CREATE TABLE IF NOT EXISTS equifax_onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Status Tracking
    status TEXT CHECK (status IN ('draft', 'manual_review_required', 'pending_bureau', 'approved', 'rejected')) DEFAULT 'draft',
    
    -- Admin-Only Hidden Tasks (Data & Transmission)
    transmission_type TEXT CHECK (transmission_type IN ('metro_2', 'cfn', null)),
    transmission_setup_completed BOOLEAN DEFAULT false,
    equifax_member_number TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Only admins can see the transmission fields. Tenants can see their own app but not admin fields.
-- (Implemented via Supabase Views or Field-Level Security / API logic in practice, 
-- but represented here for completeness)

-- 2. ONBOARDING_DATA_POINTS
-- Stores the actual data points, with per-field completion tracking for the frontend progress bar.
CREATE TABLE IF NOT EXISTS equifax_onboarding_data (
    application_id UUID PRIMARY KEY REFERENCES equifax_onboarding_applications(id) ON DELETE CASCADE,
    
    -- Company Identity
    company_name TEXT,
    company_name_completed BOOLEAN DEFAULT false,
    
    company_address TEXT,
    company_address_completed BOOLEAN DEFAULT false,
    
    company_phone TEXT,
    company_phone_completed BOOLEAN DEFAULT false,
    
    company_website TEXT,
    company_website_completed BOOLEAN DEFAULT false,
    
    industry TEXT,
    industry_other TEXT, -- Populated if industry = 'Other'
    industry_completed BOOLEAN DEFAULT false,

    -- Business Model
    repayment_duration TEXT,
    repayment_method TEXT,
    repayment_terms_completed BOOLEAN DEFAULT false,
    
    loan_ranges TEXT,
    loan_ranges_completed BOOLEAN DEFAULT false,
    
    business_model_other TEXT,
    
    -- Eligibility Logic
    estimated_records INTEGER,
    estimated_records_completed BOOLEAN DEFAULT false,

    -- Document Storage (Supabase Storage URLs)
    dispute_procedures_pdf_url TEXT,
    dispute_procedures_completed BOOLEAN DEFAULT false,
    
    lending_license_pdf_url TEXT,
    lending_license_completed BOOLEAN DEFAULT false,
    
    -- lending_license_number added for <500 validation
    lending_license_number TEXT,

    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- LOGIC & TRIGGERS
-- ==============================================================================

-- TRIGGER: Evaluate Eligibility Logic
-- "If value < 500 and 'Lending License' is null, flag as 'Manual Review Required'."
CREATE OR REPLACE FUNCTION evaluate_equifax_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Check the specific rule for manual review
    IF NEW.estimated_records < 500 AND NEW.lending_license_number IS NULL THEN
        -- Update the parent application status to flag for manual review
        UPDATE equifax_onboarding_applications
        SET status = 'manual_review_required'
        WHERE id = NEW.application_id
        AND status = 'draft'; -- Only flag if it's currently in draft
    END IF;

    -- Update timestamps
    NEW.updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_equifax_eligibility
    BEFORE UPDATE ON equifax_onboarding_data
    FOR EACH ROW
    EXECUTE FUNCTION evaluate_equifax_eligibility();

-- ==============================================================================
-- RLS POLICIES (Example)
-- ==============================================================================

ALTER TABLE equifax_onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE equifax_onboarding_data ENABLE ROW LEVEL SECURITY;

-- Tenants can read/update their own data
CREATE POLICY "Tenants view own equifax app" ON equifax_onboarding_applications
    FOR SELECT USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenants view own equifax data" ON equifax_onboarding_data
    FOR SELECT USING (application_id IN (
        SELECT id FROM equifax_onboarding_applications WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    ));

-- Admins can view/update everything
CREATE POLICY "Admins manage all equifax apps" ON equifax_onboarding_applications
    FOR ALL USING ((SELECT is_system_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Admins manage all equifax data" ON equifax_onboarding_data
    FOR ALL USING ((SELECT is_system_admin FROM profiles WHERE id = auth.uid()) = true);
