-- Create the bureau_documents table
CREATE TABLE IF NOT EXISTS bureau_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bureau TEXT NOT NULL,
    label TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bureau_documents ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see and manage their own documents
CREATE POLICY "Users can view their own bureau docs" ON bureau_documents
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bureau docs" ON bureau_documents
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own bureau docs" ON bureau_documents
    FOR DELETE USING (user_id = auth.uid());

-- Create storage bucket (run this AFTER creating the table)
-- In Supabase Dashboard > Storage > New bucket: "bureau-docs" (public: true)
