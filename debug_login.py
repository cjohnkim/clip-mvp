#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db, User

with app.app_context():
    # Find demo user
    demo_user = User.query.filter_by(email='cjohnkim@gmail.com').first()
    if demo_user:
        print(f"Found user: {demo_user.email}")
        print(f"Password hash length: {len(demo_user.password_hash) if demo_user.password_hash else 'None'}")
        
        # Test various passwords
        test_passwords = ['test123', 'password', 'demo123']
        
        for pwd in test_passwords:
            result = demo_user.check_password(pwd)
            print(f"Password '{pwd}': {'✅ CORRECT' if result else '❌ wrong'}")
        
        # Set a fresh password
        demo_user.set_password('test123')
        db.session.commit()
        print("\n🔄 Reset password to 'test123'")
        
        # Test again
        result = demo_user.check_password('test123')
        print(f"After reset - Password 'test123': {'✅ CORRECT' if result else '❌ wrong'}")
        
    else:
        print("❌ Demo user not found")