#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db, User, Account

with app.app_context():
    # Get demo user
    demo_user = User.query.filter_by(email='cjohnkim@gmail.com').first()
    if not demo_user:
        print("❌ Demo user not found")
        exit(1)
    
    print(f"✅ Found demo user: {demo_user.email}")
    
    # Create a default account
    account = Account(
        user_id=demo_user.id,
        name='Total Balance',
        account_type='checking',
        current_balance=1250.75,
        institution_name='Manual Entry',
        is_active=True,
        include_in_total=True
    )
    
    db.session.add(account)
    db.session.commit()
    print(f"✅ Created account: {account.name} with ${account.current_balance}")
    
    # Verify
    accounts = Account.query.filter_by(user_id=demo_user.id).all()
    total = sum(acc.current_balance for acc in accounts if acc.include_in_total and acc.is_active)
    print(f"✅ User now has {len(accounts)} accounts, total: ${total}")