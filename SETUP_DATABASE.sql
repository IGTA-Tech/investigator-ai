-- ========================================
-- INVESTIGATOR AI - DATABASE SETUP
-- Copy ALL of this and run in Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investigation forms (templates)
CREATE TABLE IF NOT EXISTS investigation_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  template_type TEXT CHECK (template_type IN ('company', 'influencer', 'app', 'website', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investigations (main table)
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID,
  form_id UUID,

  -- Target info
  target_name TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN ('company', 'app', 'influencer', 'website', 'other')),
  target_url TEXT,

  -- Mode info
  investigation_mode TEXT CHECK (investigation_mode IN ('form', 'portal')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Form responses (if form mode)
  form_responses JSONB DEFAULT '{}'::jsonb,

  -- Uploaded content (if portal mode)
  uploaded_files TEXT[] DEFAULT ARRAY[]::TEXT[],
  pasted_content TEXT,
  submitted_urls TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- AI Analysis Results
  legitimacy_score INTEGER CHECK (legitimacy_score >= 1 AND legitimacy_score <= 10),
  confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  recommendation TEXT CHECK (recommendation IN ('TRUST', 'PROCEED_WITH_CAUTION', 'AVOID', 'HIGH_RISK_SCAM')),
  executive_summary TEXT,

  -- Structured results
  red_flags JSONB DEFAULT '[]'::jsonb,
  legitimacy_indicators JSONB DEFAULT '[]'::jsonb,
  risk_breakdown JSONB DEFAULT '{}'::jsonb,
  business_intelligence JSONB DEFAULT '{}'::jsonb,
  evidence_sources JSONB DEFAULT '[]'::jsonb,
  key_findings TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Raw data
  raw_research_data JSONB DEFAULT '{}'::jsonb,

  -- Report
  report_url TEXT,
  report_sent_at TIMESTAMP WITH TIME ZONE,

  -- Client info
  client_email TEXT,
  client_name TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Portal access tokens (for open portal mode)
CREATE TABLE IF NOT EXISTS portal_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  investigation_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investigation_id UUID,
  email_type TEXT CHECK (email_type IN ('form_invitation', 'report_complete')),
  recipient TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_created_by ON investigations(created_by);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_token ON portal_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_logs_investigation ON email_logs(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_forms_created_by ON investigation_forms(created_by);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at_desc ON investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_target_name ON investigations(target_name);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investigation_forms_updated_at ON investigation_forms;
CREATE TRIGGER update_investigation_forms_updated_at BEFORE UPDATE ON investigation_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investigations_updated_at ON investigations;
CREATE TRIGGER update_investigations_updated_at BEFORE UPDATE ON investigations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS and create permissive policies (NO AUTH MODE)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE investigations DISABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all operations via service role" ON investigations;
DROP POLICY IF EXISTS "Allow all operations via service role" ON investigation_forms;
DROP POLICY IF EXISTS "Allow all operations via service role" ON portal_tokens;
DROP POLICY IF EXISTS "Allow all operations via service role" ON email_logs;
DROP POLICY IF EXISTS "Allow all operations via service role" ON profiles;

-- Create simple policies that allow all operations
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

-- Storage buckets (handle errors if already exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('investigation-files', 'investigation-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old storage policies
DROP POLICY IF EXISTS "Allow public uploads to investigation-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from investigation-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from reports" ON storage.objects;

-- Storage policies for investigation-files
CREATE POLICY "Allow public uploads to investigation-files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'investigation-files');

CREATE POLICY "Allow public reads from investigation-files" ON storage.objects
  FOR SELECT USING (bucket_id = 'investigation-files');

-- Storage policies for reports
CREATE POLICY "Allow public uploads to reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow public reads from reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');

-- ========================================
-- DONE! Database is ready.
-- ========================================
