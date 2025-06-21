#!/usr/bin/env python3
"""
Initialize SQLite database with waitlist tables
"""

from app import app, db
from sqlalchemy import text

def create_waitlist_tables():
    """Create waitlist and signup_tokens tables in SQLite"""
    with app.app_context():
        try:
            # Create waitlist table
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS waitlist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'pending',
                    source VARCHAR(100),
                    user_agent TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    approved_at TIMESTAMP,
                    approved_by VARCHAR(255)
                )
            """))
            
            # Create signup_tokens table  
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS signup_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (email) REFERENCES waitlist(email) ON DELETE CASCADE
                )
            """))
            
            # Create indexes
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_tokens_email ON signup_tokens(email)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_tokens_token ON signup_tokens(token)"))
            
            db.session.commit()
            print("✅ SQLite tables created successfully")
            
            # Verify tables exist
            result = db.session.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name IN ('waitlist', 'signup_tokens')
            """)).fetchall()
            
            print(f"📋 Tables created: {[row[0] for row in result]}")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    print("🗄️  Initializing SQLite Database")
    print("=" * 40)
    create_waitlist_tables()