-- Migration to make the app work WITHOUT authentication
-- This removes auth dependencies and makes created_by optional

-- Drop all RLS policies that require authentication
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own forms" ON investigation_forms;
DROP POLICY IF EXISTS "Users can create forms" ON investigation_forms;
DROP POLICY IF EXISTS "Users can update own forms" ON investigation_forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON investigation_forms;
DROP POLICY IF EXISTS "Users can view own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can create investigations" ON investigations;
DROP POLICY IF EXISTS "Users can update own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can delete own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;

-- Make created_by nullable in investigations table
ALTER TABLE investigations ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in investigation_forms table
ALTER TABLE investigation_forms ALTER COLUMN created_by DROP NOT NULL;

-- Disable RLS (we'll use service role key for all operations)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE investigations DISABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;

-- Create simple policies that allow all operations via service role
CREATE POLICY "Allow all operations via service role" ON investigations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations via service role" ON investigation_forms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations via service role" ON portal_tokens
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations via service role" ON email_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations via service role" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS with permissive policies
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update storage policies to allow public access (for demo purposes)
-- Note: In production, you'd want more restrictive policies

DROP POLICY IF EXISTS "Users can upload investigation files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own investigation files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view reports" ON storage.objects;

-- Allow anyone to upload to investigation-files bucket
CREATE POLICY "Allow public uploads to investigation-files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'investigation-files');

CREATE POLICY "Allow public reads from investigation-files" ON storage.objects
  FOR SELECT USING (bucket_id = 'investigation-files');

-- Allow anyone to upload to reports bucket
CREATE POLICY "Allow public uploads to reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow public reads from reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');

-- Make buckets public
UPDATE storage.buckets SET public = true WHERE id = 'investigation-files';
UPDATE storage.buckets SET public = true WHERE id = 'reports';

-- Drop the user creation trigger (not needed without auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Add index for faster public queries
CREATE INDEX IF NOT EXISTS idx_investigations_created_at_desc ON investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_target_name ON investigations(target_name);
