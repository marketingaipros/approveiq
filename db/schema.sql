-- 1. ORGANIZATIONS (The Tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free', -- basic, pro, enterprise
    subscription_status TEXT DEFAULT 'incomplete', -- active, past_due, canceled
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROJECTS (The Container)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, archived, completed
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CHECKLIST_ITEMS (The Atomic Units)
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT true,
    -- THE ATOMIC STATES
    status TEXT DEFAULT 'missing', -- missing, pending_review, needs_action, approved
    file_url TEXT,
    rejection_reason TEXT, -- Populates the "Fix it now" block
    last_updated_by UUID, 
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. IMMUTABLE AUDIT LOGS (Compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID,
    action TEXT NOT NULL, -- e.g., 'document_uploaded', 'status_changed'
    metadata JSONB, -- Stores the "Before" and "After" values
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Policies (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies depend on Auth implementation details (e.g. mapping auth.uid() to org_id)
-- Example Policy:
-- CREATE POLICY "Org Isolation" ON projects
-- USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
