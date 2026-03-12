-- Add the requirement_tag column if it doesn't already exist
ALTER TABLE checklist_items 
ADD COLUMN IF NOT EXISTS requirement_tag TEXT;

-- Refresh the PostgREST schema cache so the new column is immediately accessible
NOTIFY pgrst, 'reload schema';
