#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db, User, Transaction
from sqlalchemy import text

with app.app_context():
    print("=== Transaction Table Check ===")
    
    # Check table structure
    inspector = db.inspect(db.engine)
    columns = inspector.get_columns('transactions')
    print("Transaction columns:")
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")
    
    # Check demo user transactions
    demo_user = User.query.filter_by(email='cjohnkim@gmail.com').first()
    if demo_user:
        transactions = Transaction.query.filter_by(user_id=demo_user.id).all()
        print(f"\nDemo user has {len(transactions)} transactions")
        
        # Test the daily allowance calculation manually
        from datetime import date
        from sqlalchemy import func
        
        user_id = demo_user.id
        today = date.today()
        
        # Get total balance
        total_balance = db.session.query(func.sum(db.text('current_balance'))).select_from(db.text('accounts')).filter(
            db.text('user_id = :user_id AND is_active = 1 AND include_in_total = 1')
        ).params(user_id=user_id).scalar() or 0
        
        print(f"Total balance from SQL: {total_balance}")
        
        # Days remaining calculation
        import calendar
        days_in_month = calendar.monthrange(today.year, today.month)[1]
        days_remaining = days_in_month - today.day + 1
        
        print(f"Days remaining in month: {days_remaining}")
        
        if total_balance > 0 and days_remaining > 0:
            daily_allowance = float(total_balance) / days_remaining
            print(f"Calculated daily allowance: ${daily_allowance:.2f}")
        else:
            print("Daily allowance would be 0")
    else:
        print("Demo user not found")