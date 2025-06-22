#!/usr/bin/env python3
"""
Production database fix for Money Clip MVP
Run this after deployment to fix database schema issues
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_production_database():
    """Fix production database schema"""
    
    # Get database URL from environment
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///money_clip.db')
    
    # Handle Railway's postgres URL format
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    
    logger.info(f"Connecting to database: {database_url[:20]}...")
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as connection:
            
            # First, let's check what tables exist
            if 'sqlite' in database_url:
                result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = [row[0] for row in result]
            else:
                result = connection.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
                tables = [row[0] for row in result]
            
            logger.info(f"Existing tables: {tables}")
            
            # Create tables if they don't exist using raw SQL
            if 'users' not in tables:
                logger.info("Creating users table...")
                if 'sqlite' in database_url:
                    connection.execute(text("""
                        CREATE TABLE users (
                            id INTEGER PRIMARY KEY,
                            email VARCHAR(120) UNIQUE NOT NULL,
                            password_hash VARCHAR(128) NOT NULL,
                            first_name VARCHAR(50),
                            is_admin BOOLEAN DEFAULT FALSE,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
                else:
                    connection.execute(text("""
                        CREATE TABLE users (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(120) UNIQUE NOT NULL,
                            password_hash VARCHAR(128) NOT NULL,
                            first_name VARCHAR(50),
                            is_admin BOOLEAN DEFAULT FALSE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
            
            if 'accounts' not in tables:
                logger.info("Creating accounts table...")
                if 'sqlite' in database_url:
                    connection.execute(text("""
                        CREATE TABLE accounts (
                            id INTEGER PRIMARY KEY,
                            user_id INTEGER NOT NULL,
                            name VARCHAR(100) NOT NULL,
                            account_type VARCHAR(20) DEFAULT 'checking',
                            current_balance DECIMAL(10,2) DEFAULT 0.00,
                            plaid_account_id VARCHAR(255),
                            institution_name VARCHAR(100),
                            is_active BOOLEAN DEFAULT TRUE,
                            include_in_total BOOLEAN DEFAULT TRUE,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id)
                        )
                    """))
                else:
                    connection.execute(text("""
                        CREATE TABLE accounts (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER NOT NULL,
                            name VARCHAR(100) NOT NULL,
                            account_type VARCHAR(20) DEFAULT 'checking',
                            current_balance DECIMAL(10,2) DEFAULT 0.00,
                            plaid_account_id VARCHAR(255),
                            institution_name VARCHAR(100),
                            is_active BOOLEAN DEFAULT TRUE,
                            include_in_total BOOLEAN DEFAULT TRUE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id)
                        )
                    """))
            
            if 'transactions' not in tables:
                logger.info("Creating transactions table...")
                if 'sqlite' in database_url:
                    connection.execute(text("""
                        CREATE TABLE transactions (
                            id INTEGER PRIMARY KEY,
                            user_id INTEGER NOT NULL,
                            account_id INTEGER,
                            description VARCHAR(500) NOT NULL,
                            amount DECIMAL(10,2) NOT NULL,
                            date DATE NOT NULL,
                            category VARCHAR(50),
                            is_income BOOLEAN DEFAULT FALSE,
                            is_recurring BOOLEAN DEFAULT FALSE,
                            recurrence_type VARCHAR(20),
                            recurrence_interval INTEGER DEFAULT 1,
                            notes TEXT,
                            plaid_transaction_id VARCHAR(255) UNIQUE,
                            merchant_name VARCHAR(255),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id),
                            FOREIGN KEY (account_id) REFERENCES accounts (id)
                        )
                    """))
                else:
                    connection.execute(text("""
                        CREATE TABLE transactions (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER NOT NULL,
                            account_id INTEGER,
                            description VARCHAR(500) NOT NULL,
                            amount DECIMAL(10,2) NOT NULL,
                            date DATE NOT NULL,
                            category VARCHAR(50),
                            is_income BOOLEAN DEFAULT FALSE,
                            is_recurring BOOLEAN DEFAULT FALSE,
                            recurrence_type VARCHAR(20),
                            recurrence_interval INTEGER DEFAULT 1,
                            notes TEXT,
                            plaid_transaction_id VARCHAR(255) UNIQUE,
                            merchant_name VARCHAR(255),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id),
                            FOREIGN KEY (account_id) REFERENCES accounts (id)
                        )
                    """))
            
            # Create waitlist and signup_tokens tables for existing functionality
            if 'waitlist' not in tables:
                logger.info("Creating waitlist table...")
                if 'sqlite' in database_url:
                    connection.execute(text("""
                        CREATE TABLE waitlist (
                            id INTEGER PRIMARY KEY,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            name VARCHAR(255),
                            status VARCHAR(50) DEFAULT 'pending',
                            source VARCHAR(100),
                            user_agent TEXT,
                            user_metadata TEXT,
                            approved_at DATETIME,
                            approved_by VARCHAR(255),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
                else:
                    connection.execute(text("""
                        CREATE TABLE waitlist (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            name VARCHAR(255),
                            status VARCHAR(50) DEFAULT 'pending',
                            source VARCHAR(100),
                            user_agent TEXT,
                            user_metadata TEXT,
                            approved_at TIMESTAMP,
                            approved_by VARCHAR(255),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
            
            if 'signup_tokens' not in tables:
                logger.info("Creating signup_tokens table...")
                if 'sqlite' in database_url:
                    connection.execute(text("""
                        CREATE TABLE signup_tokens (
                            id INTEGER PRIMARY KEY,
                            email VARCHAR(255) NOT NULL,
                            token VARCHAR(32) UNIQUE NOT NULL,
                            expires_at DATETIME NOT NULL,
                            used_at DATETIME,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
                else:
                    connection.execute(text("""
                        CREATE TABLE signup_tokens (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(255) NOT NULL,
                            token VARCHAR(32) UNIQUE NOT NULL,
                            expires_at TIMESTAMP NOT NULL,
                            used_at TIMESTAMP,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
            
            connection.commit()
            logger.info("✅ Database schema created/verified successfully")
            
            # Now create the sample user
            create_sample_user(connection, database_url)
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Database fix failed: {e}")
        return False

def create_sample_user(connection, database_url):
    """Create sample user data in production"""
    try:
        # Check if user exists
        result = connection.execute(text("SELECT id FROM users WHERE email = :email"), 
                                  {"email": "cjohnkim@gmail.com"})
        user = result.fetchone()
        
        if not user:
            # Create user with proper password hash
            import hashlib
            import os
            
            # Simple password hashing
            salt = os.urandom(32)
            password_hash = hashlib.pbkdf2_hmac('sha256', 'SimpleClip123'.encode('utf-8'), salt, 100000)
            full_hash = salt.hex() + password_hash.hex()
            
            connection.execute(text("""
                INSERT INTO users (email, password_hash, first_name, is_admin)
                VALUES (:email, :password_hash, :first_name, :is_admin)
            """), {
                "email": "cjohnkim@gmail.com",
                "password_hash": full_hash,
                "first_name": "CJ",
                "is_admin": False
            })
            
            # Get the user ID
            result = connection.execute(text("SELECT id FROM users WHERE email = :email"), 
                                      {"email": "cjohnkim@gmail.com"})
            user_id = result.fetchone()[0]
            
            # Create sample accounts
            connection.execute(text("""
                INSERT INTO accounts (user_id, name, account_type, current_balance, institution_name, include_in_total)
                VALUES 
                (:user_id, 'Chase Freedom Checking', 'checking', 3247.85, 'Chase', TRUE),
                (:user_id, 'Chase Savings', 'savings', 12500.00, 'Chase', FALSE)
            """), {"user_id": user_id})
            
            # Create sample transactions
            from datetime import date, timedelta
            today = date.today()
            
            sample_transactions = [
                (user_id, 'Paycheck Deposit', 3200.00, today - timedelta(days=15), 'Salary', True, True, 'monthly'),
                (user_id, 'Monthly Rent', -2200.00, today.replace(day=1), 'Housing', False, True, 'monthly'),
                (user_id, 'Starbucks Coffee', -5.67, today, 'Coffee', False, False, None),
                (user_id, 'Grocery Store', -87.43, today - timedelta(days=1), 'Groceries', False, False, None),
                (user_id, 'Car Insurance', -165.00, today - timedelta(days=5), 'Insurance', False, True, 'monthly'),
            ]
            
            for tx in sample_transactions:
                connection.execute(text("""
                    INSERT INTO transactions (user_id, description, amount, date, category, is_income, is_recurring, recurrence_type)
                    VALUES (:user_id, :desc, :amount, :date, :category, :is_income, :is_recurring, :recurrence_type)
                """), {
                    "user_id": tx[0],
                    "desc": tx[1], 
                    "amount": tx[2],
                    "date": tx[3],
                    "category": tx[4],
                    "is_income": tx[5],
                    "is_recurring": tx[6],
                    "recurrence_type": tx[7]
                })
            
            connection.commit()
            logger.info("✅ Created sample user cjohnkim@gmail.com with realistic data")
        else:
            logger.info("ℹ️  User cjohnkim@gmail.com already exists")
            
    except Exception as e:
        logger.error(f"❌ Failed to create sample user: {e}")

if __name__ == '__main__':
    print("🔧 Fixing production database schema...")
    success = fix_production_database()
    if success:
        print("✅ Production database fixed successfully!")
        print("🎯 You can now test at https://app.moneyclip.money/")
        print("📧 Login: cjohnkim@gmail.com / SimpleClip123")
    else:
        print("❌ Production fix failed - check logs")