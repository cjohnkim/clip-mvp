-- Money Clip Database Tables for Supabase
-- Run this in Supabase SQL Editor

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(100),
    user_agent TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by VARCHAR(255)
);

-- Create signup_tokens table
CREATE TABLE IF NOT EXISTS signup_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (email) REFERENCES waitlist(email) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_tokens_email ON signup_tokens(email);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON signup_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON signup_tokens(expires_at);

-- Insert a test user (optional)
INSERT INTO waitlist (email, name, source, status) 
VALUES ('test@example.com', 'Test User', 'admin', 'pending')
ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('waitlist', 'signup_tokens')
ORDER BY table_name, ordinal_position;