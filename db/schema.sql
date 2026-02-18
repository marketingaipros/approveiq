-- 1. ORGANIZATIONS (The Tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'starter',
    subscription_status TEXT DEFAULT 'incomplete', 
    bureau_readiness_score INTEGER DEFAULT 0,
    mfa_enforced BOOLEAN DEFAULT FALSE,
    data_cache JSONB DEFAULT '{}',
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
    is_system_admin BOOLEAN DEFAULT FALSE,
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
    requirement_tag TEXT, 
    source_attribution TEXT,
    rejection_reason TEXT,
    file_url TEXT,
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

-- Existing Policies...
-- RLS POLICIES (Hardened for Tenant Isolation)

-- Organizations: Only members of the org can view their org record
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid() LIMIT 1)
        OR id IS NULL
    );

-- Profiles: Users can always view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Profiles: Org-based visibility (using a subquery that bypasses RLS for the user's own org_id)
CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (
        org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid() LIMIT 1)
    );

-- Bureau Programs: Org-based isolation
CREATE POLICY "Users can view their org bureau programs" ON bureau_programs
    FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their org bureau programs" ON bureau_programs
    FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their org bureau programs" ON bureau_programs
    FOR UPDATE USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Checklist Items: Isolation via bureau_programs
CREATE POLICY "Users can view their org checklist items" ON checklist_items
    FOR SELECT USING (
        program_id IN (
            SELECT id FROM bureau_programs 
            WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can update their org checklist items" ON checklist_items
    FOR UPDATE USING (
        program_id IN (
            SELECT id FROM bureau_programs 
            WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Knowledge Base: Global Read Access (No isolation needed for generic guidance)
CREATE POLICY "Allow public read access to knowledge base" ON knowledge_base
    FOR SELECT USING (true);

-- Audit Logs: Org-based isolation
CREATE POLICY "Users can view their org audit logs" ON audit_logs
    FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- 7. AUTH SYNC (Auto-create profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, org_id)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'avatar_url',
        CASE 
            WHEN (new.raw_user_meta_data->>'org_id') IS NOT NULL AND (new.raw_user_meta_data->>'org_id') != ''
            THEN (new.raw_user_meta_data->>'org_id')::uuid
            ELSE NULL
        END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. AUDIT LOGGING TRIGGER
CREATE OR REPLACE FUNCTION public.audit_checklist_item_change()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get org_id from the program associated with the checklist item
    SELECT org_id INTO v_org_id 
    FROM bureau_programs 
    WHERE id = COALESCE(new.program_id, old.program_id);

    INSERT INTO public.audit_logs (org_id, user_id, action, metadata)
    VALUES (
        v_org_id,
        new.last_updated_by,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'CHECKLIST_ITEM_CREATED'
            WHEN TG_OP = 'UPDATE' THEN 'CHECKLIST_ITEM_UPDATED'
            WHEN TG_OP = 'DELETE' THEN 'CHECKLIST_ITEM_DELETED'
        END,
        jsonb_build_object(
            'item_id', COALESCE(new.id, old.id),
            'title', COALESCE(new.title, old.title),
            'old_status', old.status,
            'new_status', new.status,
            'rejection_reason', new.rejection_reason
        )
    );
    RETURN COALESCE(new, old);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_checklist_item_change
    AFTER INSERT OR UPDATE OR DELETE ON checklist_items
    FOR EACH ROW EXECUTE PROCEDURE public.audit_checklist_item_change();

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 9. BUREAU_TEMPLATES (Global Templates)
CREATE TABLE IF NOT EXISTS bureau_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    bureau TEXT NOT NULL,
    bureau_guidelines TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. TEMPLATE_ITEMS
CREATE TABLE IF NOT EXISTS template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES bureau_templates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT TRUE,
    requirement_tag TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Templates
ALTER TABLE bureau_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;

-- Templates: Global Read Access
CREATE POLICY "Allow public read access to bureau_templates" ON bureau_templates
    FOR SELECT USING (true);

-- Templates: Admin Only Write Access
CREATE POLICY "Admins can manage bureau_templates" ON bureau_templates
    FOR ALL USING (
        (SELECT p.is_system_admin FROM profiles p WHERE p.id = auth.uid() LIMIT 1) = true
    );

-- Template Items: Global Read Access
CREATE POLICY "Allow public read access to template_items" ON template_items
    FOR SELECT USING (true);

-- Template Items: Admin Only Write Access
CREATE POLICY "Admins can manage template_items" ON template_items
    FOR ALL USING (
        (SELECT p.is_system_admin FROM profiles p WHERE p.id = auth.uid() LIMIT 1) = true
    );
