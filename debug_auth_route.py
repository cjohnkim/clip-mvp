#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from app import app
from models_simple import db, User
import json

# Simulate the login route
with app.app_context():
    # Simulate request data
    data = {
        'email': 'cjohnkim@gmail.com',
        'password': 'test123'
    }
    
    print("=== Simulating Login Route ===")
    print(f"Input data: {data}")
    
    try:
        # Validate required fields
        if not data or not data.get('email') or not data.get('password'):
            print("❌ Missing email or password")
        else:
            print("✅ Email and password provided")
        
        email = data['email'].lower().strip()
        password = data['password']
        
        print(f"Processed email: '{email}'")
        print(f"Processed password: '{password}'")
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print("❌ User not found")
        else:
            print(f"✅ User found: {user.email} (ID: {user.id})")
            
            # Check password
            password_valid = user.check_password(password)
            print(f"Password check result: {'✅ VALID' if password_valid else '❌ INVALID'}")
            
            if password_valid:
                print("✅ Login should succeed")
            else:
                print("❌ Login should fail")
                
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        import traceback
        traceback.print_exc()