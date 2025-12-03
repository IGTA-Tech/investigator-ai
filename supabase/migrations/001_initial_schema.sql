-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Investigation forms (templates)
CREATE TABLE investigation_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  template_type TEXT CHECK (template_type IN ('company', 'influencer', 'app', 'website', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE investigation_forms ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Users can view own forms" ON investigation_forms
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create forms" ON investigation_forms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own forms" ON investigation_forms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own forms" ON investigation_forms
  FOR DELETE USING (auth.uid() = created_by);

-- Investigations (main table)
CREATE TABLE investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  form_id UUID REFERENCES investigation_forms(id) ON DELETE SET NULL,

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

-- Enable RLS
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;

-- Investigations policies
CREATE POLICY "Users can view own investigations" ON investigations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create investigations" ON investigations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own investigations" ON investigations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own investigations" ON investigations
  FOR DELETE USING (auth.uid() = created_by);

-- Portal access tokens (for open portal mode)
CREATE TABLE portal_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portal_tokens ENABLE ROW LEVEL SECURITY;

-- Portal tokens policies
CREATE POLICY "Portal tokens are publicly accessible by token" ON portal_tokens
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  email_type TEXT CHECK (email_type IN ('form_invitation', 'report_complete')),
  recipient TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Email logs policies
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM investigations
      WHERE investigations.id = email_logs.investigation_id
      AND investigations.created_by = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_investigations_created_by ON investigations(created_by);
CREATE INDEX idx_investigations_created_at ON investigations(created_at DESC);
CREATE INDEX idx_portal_tokens_token ON portal_tokens(token);
CREATE INDEX idx_email_logs_investigation ON email_logs(investigation_id);
CREATE INDEX idx_investigation_forms_created_by ON investigation_forms(created_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigation_forms_updated_at BEFORE UPDATE ON investigation_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigations_updated_at BEFORE UPDATE ON investigations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('investigation-files', 'investigation-files', false);

-- Storage policies
CREATE POLICY "Users can upload investigation files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'investigation-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own investigation files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'investigation-files' AND
    auth.role() = 'authenticated'
  );

-- Storage bucket for reports
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- Reports storage policies
CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );
