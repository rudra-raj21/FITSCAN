-- SmartBuckets Data Table for Raindrop Integration
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS smartbuckets_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket TEXT NOT NULL,
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smartbuckets_bucket ON smartbuckets_data(bucket);
CREATE INDEX IF NOT EXISTS idx_smartbuckets_document_id ON smartbuckets_data(document_id);
CREATE INDEX IF NOT EXISTS idx_smartbuckets_user ON smartbuckets_data USING GIN ((metadata->>'userId'));
CREATE INDEX IF NOT EXISTS idx_smartbuckets_created_at ON smartbuckets_data(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE smartbuckets_data ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own data
CREATE POLICY "Users can manage their own smartbuckets data" ON smartbuckets_data
  FOR ALL USING (
    auth.uid() IS NOT NULL AND 
    metadata->>'userId' = auth.uid()::text
  );

-- Create policy for service role (useful for imports)
CREATE POLICY "Service role can manage all smartbuckets data" ON smartbuckets_data
  FOR ALL USING (
    role() = 'service_role'
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_smartbuckets_updated_at 
  BEFORE UPDATE ON smartbuckets_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE smartbuckets_data IS 'Stores data for Raindrop SmartBuckets integration including meal history and nutrition insights';