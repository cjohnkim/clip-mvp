#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db, User, Account

with app.app_context():
    # Check if tables exist
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    print('Tables:', tables)
    
    # Check if demo user exists
    demo_user = User.query.filter_by(email='cjohnkim@gmail.com').first()
    if demo_user:
        print('Demo user exists')
        accounts = Account.query.filter_by(user_id=demo_user.id).all()
        print(f'User has {len(accounts)} accounts')
        for acc in accounts:
            print(f'  - {acc.name}: ${acc.current_balance}')
    else:
        print('Demo user not found')