#!/usr/bin/env python3
"""
Migration script to update database schema for simplified Money Clip MVP
"""

import os
import sys
from sqlalchemy import create_engine, text
from models_simple import db, User, Account, Transaction, RecurringItem, Budget, Waitlist, SignupToken

def migrate_database():
    """Migrate database to simplified schema"""
    
    # Use the database URL from environment or default
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///money_clip.db')
    print(f"Migrating database: {database_url}")
    
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as connection:
            # Add new columns to transactions table if they don't exist
            try:
                connection.execute(text("""
                    ALTER TABLE transactions 
                    ADD COLUMN recurrence_type VARCHAR(20)
                """))
                print("✅ Added recurrence_type column")
            except Exception as e:
                print(f"ℹ️  recurrence_type column exists or error: {e}")
            
            try:
                connection.execute(text("""
                    ALTER TABLE transactions 
                    ADD COLUMN recurrence_interval INTEGER DEFAULT 1
                """))
                print("✅ Added recurrence_interval column")
            except Exception as e:
                print(f"ℹ️  recurrence_interval column exists or error: {e}")
            
            try:
                connection.execute(text("""
                    ALTER TABLE transactions 
                    ADD COLUMN notes TEXT
                """))
                print("✅ Added notes column")
            except Exception as e:
                print(f"ℹ️  notes column exists or error: {e}")
            
            # Add include_in_total column to accounts if it doesn't exist
            try:
                connection.execute(text("""
                    ALTER TABLE accounts 
                    ADD COLUMN include_in_total BOOLEAN DEFAULT TRUE
                """))
                print("✅ Added include_in_total column to accounts")
            except Exception as e:
                print(f"ℹ️  include_in_total column exists or error: {e}")
            
            connection.commit()
            print("✅ Database migration completed successfully")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

def create_sample_data():
    """Create sample data for testing"""
    from app import app
    
    with app.app_context():
        try:
            # Check if we already have data
            if User.query.first():
                print("ℹ️  Sample data already exists")
                return
            
            # Create a test user
            test_user = User(
                email='test@moneyclip.money',
                first_name='Test',
                is_admin=False
            )
            test_user.set_password('TestPassword123!')
            db.session.add(test_user)
            db.session.flush()  # Get the user ID
            
            # Create sample accounts
            checking = Account(
                user_id=test_user.id,
                name='Chase Checking',
                account_type='checking',
                current_balance=2847.32,
                institution_name='Chase',
                include_in_total=True
            )
            
            savings = Account(
                user_id=test_user.id,
                name='Savings Account',
                account_type='savings',
                current_balance=5000.00,
                institution_name='Chase',
                include_in_total=False  # Don't include in daily calculations
            )
            
            db.session.add_all([checking, savings])
            db.session.flush()
            
            # Create sample transactions
            from datetime import date, timedelta
            
            transactions = [
                Transaction(
                    user_id=test_user.id,
                    account_id=checking.id,
                    description='Paycheck Deposit',
                    amount=3200.00,
                    date=date.today() - timedelta(days=15),
                    category='Salary',
                    is_income=True,
                    is_recurring=True,
                    recurrence_type='monthly',
                    recurrence_interval=1
                ),
                Transaction(
                    user_id=test_user.id,
                    account_id=checking.id,
                    description='Starbucks Coffee',
                    amount=-5.67,
                    date=date.today(),
                    category='Dining',
                    is_income=False,
                    notes='Morning coffee'
                ),
                Transaction(
                    user_id=test_user.id,
                    account_id=checking.id,
                    description='Grocery Store',
                    amount=-87.43,
                    date=date.today() - timedelta(days=1),
                    category='Groceries',
                    is_income=False
                ),
                Transaction(
                    user_id=test_user.id,
                    account_id=checking.id,
                    description='Monthly Rent',
                    amount=-1200.00,
                    date=date.today().replace(day=1),
                    category='Housing',
                    is_income=False,
                    is_recurring=True,
                    recurrence_type='monthly',
                    recurrence_interval=1
                ),
            ]
            
            db.session.add_all(transactions)
            db.session.commit()
            
            print("✅ Sample data created successfully")
            print(f"   Test user: test@moneyclip.money / TestPassword123!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to create sample data: {e}")

if __name__ == '__main__':
    print("🔄 Starting Money Clip MVP database migration...")
    
    if migrate_database():
        print("\n🔄 Creating sample data...")
        create_sample_data()
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)