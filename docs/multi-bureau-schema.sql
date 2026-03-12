-- ==============================================================================
-- MULTI-BUREAU ONBOARDING ENGINE SCHEMA
-- ==============================================================================

-- 0. BUREAUS (The Flexibility Layer)
-- Defines available bureaus so admins can add new ones without code changes
CREATE TABLE IF NOT EXISTS bureaus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1. MASTER PROFILE
-- Universal Mapping: Single source of truth for company identity
CREATE TABLE IF NOT EXISTS bureau_master_profiles (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Legal Identity
    company_name TEXT NOT NULL,
    company_address TEXT,
    company_phone TEXT,
    company_website TEXT,
    
    -- Leadership
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    
    -- History
    years_in_business TEXT,
    customer_acquisition TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BUREAU APPLICATIONS
-- Links an organization to a specific bureau process (e.g., Equifax, Experian)
CREATE TABLE IF NOT EXISTS bureau_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    bureau_name TEXT NOT NULL REFERENCES bureaus(name) ON DELETE CASCADE, 
    
    -- Status Tracking
    status TEXT CHECK (status IN ('draft', 'manual_review_required', 'pending_bureau', 'approved', 'rejected')) DEFAULT 'draft',
    
    -- Admin-Only
    admin_notes TEXT,
    transmission_type TEXT,
    transmission_setup_completed BOOLEAN DEFAULT false,
    member_number TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    notified_at TIMESTAMPTZ,
    UNIQUE(org_id, bureau_name)
);

-- 3. DYNAMIC REQUIREMENTS (Admin Requirement Manager)
-- Allows adding new questions without redeploying
CREATE TABLE IF NOT EXISTS dynamic_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bureau_name TEXT NOT NULL, -- e.g., 'Equifax', 'Experian', 'Global' (for shared questions)
    field_key TEXT NOT NULL UNIQUE, -- e.g., 'estimated_records', 'dnb_duns'
    field_label TEXT NOT NULL,
    field_type TEXT CHECK (field_type IN ('text', 'number', 'select', 'file')) NOT NULL,
    options JSONB, -- For dropdowns: e.g., ["Auto", "Consulting", "Other"]
    is_required BOOLEAN DEFAULT true,
    validation_rules JSONB, -- e.g., {"min_value": 500, "triggers_manual_review": true}
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DYNAMIC ANSWERS
-- Stores the actual responses to the dynamic requirements
CREATE TABLE IF NOT EXISTS dynamic_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES dynamic_requirements(id) ON DELETE CASCADE,
    
    answer_value TEXT, -- Text, number as string, or URL for files
    answer_other TEXT, -- Populated if the 'Other' protocol was triggered
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, requirement_id)
);

-- ==============================================================================
-- LOGIC & TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bureau_master_profiles_modtime ON bureau_master_profiles;
CREATE TRIGGER update_bureau_master_profiles_modtime
    BEFORE UPDATE ON bureau_master_profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_bureau_applications_modtime ON bureau_applications;
CREATE TRIGGER update_bureau_applications_modtime
    BEFORE UPDATE ON bureau_applications
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_dynamic_answers_modtime ON dynamic_answers;
CREATE TRIGGER update_dynamic_answers_modtime
    BEFORE UPDATE ON dynamic_answers
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
