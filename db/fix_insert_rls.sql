-- Add the missing INSERT policy for checklist_items
CREATE POLICY "Users can insert their org checklist items" ON checklist_items
    FOR INSERT WITH CHECK (
        program_id IN (
            SELECT id FROM bureau_programs 
            WHERE org_id = get_current_user_org_id()
        )
    );
