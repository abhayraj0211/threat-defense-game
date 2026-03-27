
-- Create table for storing phishing email scans
CREATE TABLE public.phishing_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_content TEXT NOT NULL,
  is_phishing BOOLEAN NOT NULL,
  confidence INTEGER NOT NULL,
  indicators TEXT[] NOT NULL DEFAULT '{}',
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phishing_scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert scans
CREATE POLICY "Anyone can insert scans"
  ON public.phishing_scans FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read scans
CREATE POLICY "Anyone can read scans"
  ON public.phishing_scans FOR SELECT
  USING (true);
