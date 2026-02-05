-- 1. ORGANIZATIONS (The Tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'starter',
    subscription_status TEXT DEFAULT 'incomplete', 
    bureau_readiness_score INTEGER DEFAULT 0,
    mfa_enforced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES (Users & Roles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('Owner', 'Admin', 'Contributor', 'Viewer')) DEFAULT 'Viewer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BUREAU_PROGRAMS
CREATE TABLE IF NOT EXISTS bureau_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    bureau TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    progress_percent INTEGER DEFAULT 0,
    attested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CHECKLIST_ITEMS
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES bureau_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'missing',
    required BOOLEAN DEFAULT TRUE,
    source_attribution TEXT,
    rejection_reason TEXT,
    last_updated_by UUID, 
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. KNOWLEDGE_BASE
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    bureau TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID,
    action TEXT NOT NULL, 
    metadata JSONB, 
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bureau_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow Public Access" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON bureau_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON checklist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Access" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
