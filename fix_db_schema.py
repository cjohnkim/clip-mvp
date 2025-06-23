#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db
from sqlalchemy import text

with app.app_context():
    try:
        # Add missing is_admin column to users table
        db.session.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
        print("✅ Added is_admin column to users table")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("ℹ️  is_admin column already exists")
        else:
            print(f"❌ Error adding is_admin column: {e}")
    
    # Add all missing columns to accounts table
    missing_columns = [
        ("include_in_total", "BOOLEAN DEFAULT TRUE"),
        ("plaid_account_id", "VARCHAR(255)"),
        ("institution_name", "VARCHAR(100)"),
        ("is_active", "BOOLEAN DEFAULT TRUE"),
        ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP")
    ]
    
    for col_name, col_def in missing_columns:
        try:
            db.session.execute(text(f"ALTER TABLE accounts ADD COLUMN {col_name} {col_def}"))
            print(f"✅ Added {col_name} column to accounts table")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print(f"ℹ️  {col_name} column already exists")
            else:
                print(f"❌ Error adding {col_name} column: {e}")
    
    try:
        # Commit changes
        db.session.commit()
        print("✅ Database schema updated successfully")
        
        # Now test the demo user
        from models_simple import User, Account
        
        demo_user = User.query.filter_by(email='cjohnkim@gmail.com').first()
        if demo_user:
            print(f"✅ Demo user found: {demo_user.email}")
            accounts = Account.query.filter_by(user_id=demo_user.id).all()
            print(f"✅ User has {len(accounts)} accounts")
            for acc in accounts:
                print(f"   - {acc.name}: ${acc.current_balance}")
        else:
            print("❌ Demo user not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.session.rollback()