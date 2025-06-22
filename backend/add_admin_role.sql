-- Database migration to add admin role support
-- Run this SQL on your production database

-- Add is_admin column to users table (if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_admin'
    ) THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'is_admin column already exists';
    END IF;
END $$;

-- Set cjohnkim@gmail.com as admin
UPDATE users SET is_admin = TRUE WHERE email = 'cjohnkim@gmail.com';

-- Verify the update
SELECT id, email, first_name, is_admin, created_at 
FROM users 
WHERE email = 'cjohnkim@gmail.com';

-- Show all admin users
SELECT id, email, first_name, is_admin, created_at 
FROM users 
WHERE is_admin = TRUE;