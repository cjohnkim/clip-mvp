#!/usr/bin/env python3
"""
Set admin role for specific user
"""

import os
import sys
import requests
import json

def set_admin_role():
    """Set admin role for cjohnkim@gmail.com"""
    try:
        base_url = "https://clip-mvp-production.up.railway.app"
        admin_email = "cjohnkim@gmail.com"
        
        print("🔧 Setting Admin Role")
        print("=" * 50)
        print(f"Email: {admin_email}")
        print()
        
        # First, test if we can run SQL migration via API
        print("1. Adding is_admin column to users table...")
        
        # Create migration SQL
        migration_sql = """
        -- Add is_admin column if it doesn't exist
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='is_admin'
            ) THEN
                ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
            END IF;
        END $$;
        
        -- Set cjohnkim@gmail.com as admin
        UPDATE users SET is_admin = TRUE WHERE email = 'cjohnkim@gmail.com';
        """
        
        # We'll need to create an API endpoint to run this migration
        # For now, let's just make the requests to set up the user properly
        
        print("2. Creating/updating admin user...")
        
        # Try to create the account (might already exist)
        signup_response = requests.post(
            f"{base_url}/api/auth/signup",
            json={
                "email": admin_email,
                "password": "PinkyKim1",
                "first_name": "John"
            }
        )
        
        if signup_response.status_code in [200, 201]:
            print("✅ Admin account ready")
        elif signup_response.status_code == 400:
            signup_data = signup_response.json()
            if "already exists" in signup_data.get('error', ''):
                print("ℹ️  Admin account already exists")
            else:
                print(f"❌ Signup error: {signup_data}")
        
        print()
        print("3. Testing login...")
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            json={
                "email": admin_email,
                "password": "PinkyKim1"
            }
        )
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            user_data = login_data.get('user', {})
            is_admin = user_data.get('is_admin', False)
            
            print("✅ Login successful!")
            print(f"🔑 User ID: {user_data.get('id')}")
            print(f"👤 Name: {user_data.get('first_name')}")
            print(f"🛡️  Admin status: {is_admin}")
            
            if is_admin:
                print()
                print("🎉 Admin role is already active!")
                
                # Test admin access
                jwt_token = login_data.get('access_token')
                admin_response = requests.get(
                    f"{base_url}/api/admin/waitlist/list",
                    headers={
                        'Authorization': f'Bearer {jwt_token}',
                        'Content-Type': 'application/json'
                    }
                )
                
                if admin_response.status_code == 200:
                    admin_data = admin_response.json()
                    print(f"✅ Admin access confirmed! Found {admin_data.get('total', 0)} waitlist users")
                else:
                    print(f"❌ Admin access test failed: {admin_response.json()}")
            else:
                print()
                print("⚠️  Admin role not set yet.")
                print("💡 You need to run this migration on your database:")
                print()
                print("-- Add is_admin column")
                print("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;")
                print()
                print("-- Set admin role")
                print(f"UPDATE users SET is_admin = TRUE WHERE email = '{admin_email}';")
                print()
                
        else:
            login_data = login_response.json()
            print(f"❌ Login failed: {login_data}")
        
        print()
        print("🎯 Summary:")
        print(f"📧 Admin email: {admin_email}")
        print(f"🔐 Password: PinkyKim1")
        print(f"🌐 Admin URL: https://app.moneyclip.money/admin")
        print("🔧 Database migration needed to add is_admin column")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    set_admin_role()