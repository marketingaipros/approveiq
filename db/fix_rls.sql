-- 1. Remove the broken recursive policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- 2. Create a secure function to bypass RLS for fetching the current user's org_id
CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$;

-- 3. Replace the policy using the secure function to avoid infinite loops
CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (
        org_id = get_current_user_org_id()
    );
