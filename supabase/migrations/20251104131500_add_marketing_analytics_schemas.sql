-- Create marketing schema for website, leads, and content management
CREATE SCHEMA IF NOT EXISTS marketing;

-- Create analytics schema for usage tracking and metrics  
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set up marketing tables
CREATE TABLE IF NOT EXISTS marketing.landing_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content JSONB,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    source TEXT, -- 'landing_page', 'social', 'referral', etc.
    utm_source TEXT,
    utm_campaign TEXT,  
    utm_medium TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted', 'unsubscribed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT, -- 'email', 'social', 'ads', 'content'
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    target_audience JSONB,
    metrics JSONB, -- clicks, impressions, conversions, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up analytics tables
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- references auth.users if logged in
    session_id TEXT,
    page_path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics.user_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- references auth.users if logged in
    session_id TEXT,
    action_type TEXT NOT NULL, -- 'click', 'form_submit', 'video_play', etc.
    target_element TEXT, -- button ID, form name, etc.
    page_path TEXT,
    metadata JSONB, -- additional action-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics.app_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4),
    metric_type TEXT, -- 'counter', 'gauge', 'histogram'
    dimensions JSONB, -- tags/labels for the metric
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON marketing.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON marketing.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON analytics.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON analytics.user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON analytics.user_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_app_metrics_metric_name ON analytics.app_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_app_metrics_created_at ON analytics.app_metrics(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE marketing.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.leads ENABLE ROW LEVEL SECURITY;  
ALTER TABLE marketing.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.app_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (admin users can manage everything, public can read landing pages)
CREATE POLICY "Public can view active landing pages" ON marketing.landing_pages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage landing pages" ON marketing.landing_pages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage leads" ON marketing.leads
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage campaigns" ON marketing.campaigns  
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view analytics" ON analytics.page_views
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view user actions" ON analytics.user_actions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view app metrics" ON analytics.app_metrics
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Allow anonymous users to insert page views and actions for tracking
CREATE POLICY "Anyone can insert page views" ON analytics.page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert user actions" ON analytics.user_actions  
    FOR INSERT WITH CHECK (true);

-- Grant schema usage permissions
GRANT USAGE ON SCHEMA marketing TO anon, authenticated;
GRANT USAGE ON SCHEMA analytics TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON marketing.landing_pages TO anon, authenticated;
GRANT INSERT ON analytics.page_views TO anon, authenticated;
GRANT INSERT ON analytics.user_actions TO anon, authenticated;

-- Add some sample data for testing
INSERT INTO marketing.landing_pages (slug, title, content, meta_description) VALUES 
('home', 'Felony Fitness - Transform Your Body, Transform Your Life', 
 '{"hero": "Ready to get in the best shape of your life?", "cta": "Start Your Journey"}',
 'Professional fitness coaching and nutrition guidance for real results'),
('about', 'About Felony Fitness', 
 '{"story": "Our mission is to help you achieve your fitness goals", "team": "Meet our certified trainers"}',
 'Learn about our fitness philosophy and experienced coaching team');

INSERT INTO marketing.campaigns (name, description, type, status) VALUES
('Launch Campaign', 'Initial marketing campaign for app launch', 'mixed', 'active'),
('Social Media Push', 'Instagram and TikTok content marketing', 'social', 'active');

COMMENT ON SCHEMA marketing IS 'Marketing website, lead capture, and campaign management';
COMMENT ON SCHEMA analytics IS 'User behavior tracking and application metrics';

-- Functions for common analytics queries
CREATE OR REPLACE FUNCTION analytics.get_daily_page_views(start_date DATE, end_date DATE)
RETURNS TABLE(date DATE, page_path TEXT, views BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        page_path,
        COUNT(*) as views
    FROM analytics.page_views
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at), page_path
    ORDER BY date DESC, views DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;