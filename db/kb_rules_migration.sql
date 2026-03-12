-- Add structured rules column to knowledge_base
-- Run this in your Supabase SQL Editor

ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS rules_json JSONB;

-- Refresh PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

-- Example: update existing Equifax entry with rules
-- UPDATE knowledge_base SET rules_json = '{
--   "min_records": 500,
--   "requires_dispute_doc": true,
--   "requires_lending_license": false,
--   "repayment_types": ["ACH", "Credit", "Debit"],
--   "required_checklist_tags": ["METRO2_VALIDATION", "SERVICE_AGREEMENT", "SECURITY_AUDIT"]
-- }' WHERE bureau = 'equifax';
