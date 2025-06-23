#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db, User, Account
from datetime import datetime

with app.app_context():
    print("=== Demo User Check ===")
    
    # Check if demo user exists
    demo_user = User.query.filter_by(email='cjohnkim@gmail.com').first()
    if demo_user:
        print(f"✅ Demo user exists: {demo_user.email} (ID: {demo_user.id})")
        
        # Check accounts
        accounts = Account.query.filter_by(user_id=demo_user.id).all()
        print(f"   Accounts: {len(accounts)}")
        for acc in accounts:
            print(f"   - {acc.name}: ${acc.current_balance} (active: {acc.is_active}, include: {acc.include_in_total})")
            
        # Get total balance calculation
        total_balance = sum(acc.current_balance for acc in accounts if acc.include_in_total and acc.is_active)
        print(f"   Calculated total: ${total_balance}")
        
    else:
        print("❌ Demo user not found. Creating...")
        
        # Create demo user
        demo_user = User(
            email='cjohnkim@gmail.com',
            first_name='CJ',
            is_admin=True
        )
        demo_user.set_password('SimpleClip123')
        db.session.add(demo_user)
        db.session.commit()
        print(f"✅ Created demo user: {demo_user.email}")
        
        # Create a default account
        account = Account(
            user_id=demo_user.id,
            name='Total Balance',
            account_type='checking',
            current_balance=1500.00,
            institution_name='Manual Entry',
            is_active=True,
            include_in_total=True
        )
        db.session.add(account)
        db.session.commit()
        print(f"✅ Created default account with $1500")