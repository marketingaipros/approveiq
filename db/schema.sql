-- 1. ORGANIZATIONS (The Tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'starter', -- starter (single), pro (multi), enterprise
    subscription_status TEXT DEFAULT 'incomplete', 
    bureau_readiness_score INTEGER DEFAULT 0, -- Procedural metric (0-100)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BUREAU_PROGRAMS (Was Projects) -> The "Credit Bureau Program"
CREATE TABLE IF NOT EXISTS bureau_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- e.g., "Experian Data Furnisher", "Equifax Metro 2"
    bureau TEXT NOT NULL, -- 'experian', 'equifax', 'dnb', 'sba'
    status TEXT DEFAULT 'active', -- active, locked_for_review, submitted, approved
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CHECKLIST_ITEMS (Atomic Units)
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES bureau_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- e.g., "Articles of Incorporation"
    description TEXT, -- Procedural requirement text
    source_attribution TEXT, -- e.g., "Source: Experian Technical Requirements v2.4"
    required BOOLEAN DEFAULT true,
    -- THE ATOMIC STATES
    status TEXT DEFAULT 'missing', -- missing, pending_review, needs_action, approved
    file_url TEXT,
    rejection_reason TEXT, -- Populates "Fix It Now"
    last_updated_by UUID, 
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. KNOWLEDGE_BASE (Separation Rule)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    content TEXT NOT NULL, -- Procedural explanations only
    bureau TEXT, -- Linked to specific bureau or 'general'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. IMMUTABLE AUDIT LOGS (Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID,
    action TEXT NOT NULL, 
    metadata JSONB, 
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Policies (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bureau_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- OPEN ACCESS POLICY FOR PROTOTYPE (Replace with strict RLS later)
CREATE POLICY "Allow Public Access" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON bureau_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON checklist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- STORAGE BUCKET setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Documents" ON storage.objects FOR ALL USING (bucket_id = 'documents');

-- SEED DATA (Credit Bureau Focused)
DO $$
DECLARE
    org_id UUID;
    program_id UUID;
BEGIN
    -- Create Client Org
    INSERT INTO organizations (name, subscription_status, subscription_tier, bureau_readiness_score)
    VALUES ('Acme Logistics LLC', 'active', 'professional', 15)
    RETURNING id INTO org_id;

    -- Create Experian Program
    INSERT INTO bureau_programs (org_id, title, bureau, status, progress_percent)
    VALUES (org_id, 'Experian Data Furnisher Application', 'experian', 'active', 20)
    RETURNING id INTO program_id;

    -- Create Checklist Items (Procedural Language Only)
    INSERT INTO checklist_items (program_id, title, description, source_attribution, status, required, rejection_reason) VALUES
    (program_id, 'Metro 2® File Validation', 'Upload a sample file passing the Metro 2® standard format checks.', 'Source: CDIA Metro 2® Format 2024', 'needs_action', true, 'File failed Record 426 validation check.'),
    (program_id, 'Data Subscriber Agreement (DSA)', 'Upload the signed DSA header page.', 'Source: Experian Legal', 'missing', true, null),
    (program_id, 'Security Audit Attestation', 'Upload SOC 2 Type 2 or equivalent attestation.', 'Source: Experian Security Standards', 'pending_review', true, null);

END $$;
