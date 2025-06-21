#!/usr/bin/env python3
"""
Create waitlist and signup_tokens tables in Supabase
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection string
DATABASE_URL = "postgresql://postgres:YEzRdwW4kki0aeVj@db.uoitkodrheedbuwkffjq.supabase.co:5432/postgres"

def create_tables():
    """Create waitlist and signup_tokens tables"""
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("🔗 Connected to Supabase database")
        
        # Create waitlist table
        waitlist_sql = """
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
        """
        
        cursor.execute(waitlist_sql)
        print("✅ Created waitlist table")
        
        # Create signup_tokens table
        tokens_sql = """
        CREATE TABLE IF NOT EXISTS signup_tokens (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (email) REFERENCES waitlist(email) ON DELETE CASCADE
        );
        """
        
        cursor.execute(tokens_sql)
        print("✅ Created signup_tokens table")
        
        # Create indexes for performance
        indexes_sql = [
            "CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);",
            "CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);",
            "CREATE INDEX IF NOT EXISTS idx_tokens_email ON signup_tokens(email);",
            "CREATE INDEX IF NOT EXISTS idx_tokens_token ON signup_tokens(token);",
            "CREATE INDEX IF NOT EXISTS idx_tokens_expires ON signup_tokens(expires_at);"
        ]
        
        for index_sql in indexes_sql:
            cursor.execute(index_sql)
        
        print("✅ Created database indexes")
        
        # Commit changes
        conn.commit()
        
        # Test tables exist
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('waitlist', 'signup_tokens')
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"\n📋 Tables created: {[table[0] for table in tables]}")
        
        # Check if tables are empty
        cursor.execute("SELECT COUNT(*) FROM waitlist;")
        waitlist_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM signup_tokens;")
        tokens_count = cursor.fetchone()[0]
        
        print(f"📊 Waitlist entries: {waitlist_count}")
        print(f"📊 Signup tokens: {tokens_count}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Database setup complete!")
        print("You can now test waitlist signup at: https://app.moneyclip.money/auth?mode=waitlist")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🗄️  Setting up Money Clip Database Tables")
    print("=" * 50)
    create_tables()