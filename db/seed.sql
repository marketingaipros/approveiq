-- ABSOLUTE RECOVERY & BYPASS
-- This script ensures the master organization and your admin profile are perfectly synchronized.

-- 1. Create/Fix the Master Organization
INSERT INTO public.organizations (id, name, subscription_tier, subscription_status)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'ApproveIQ Master Org', 
    'enterprise', 
    'active'
)
ON CONFLICT (id) DO UPDATE SET 
    name = 'ApproveIQ Master Org',
    subscription_tier = 'enterprise',
    subscription_status = 'active';

-- 2. Create/Fix Your Profile
INSERT INTO public.profiles (id, org_id, full_name, role, is_system_admin)
VALUES (
    'a1c8f199-63b0-43a8-b82d-12c21c59187e', 
    '00000000-0000-0000-0000-000000000000',
    'System Administrator', 
    'Owner', 
    true
)
ON CONFLICT (id) DO UPDATE 
SET 
    is_system_admin = true, 
    role = 'Owner', 
    org_id = '00000000-0000-0000-0000-000000000000';

-- 3. Seed some dummy data for visibility
INSERT INTO public.bureau_programs (id, org_id, title, bureau, status)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Experian Enterprise Readiness',
    'Experian',
    'active'
)
ON CONFLICT DO NOTHING;
