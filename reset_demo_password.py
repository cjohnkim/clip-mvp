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
        # Set a known password
        demo_user.set_password('test123')
        db.session.commit()
        print(f"✅ Password reset for {demo_user.email}")
        
        # Test the password
        if demo_user.check_password('test123'):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")
    else:
        print("❌ Demo user not found")