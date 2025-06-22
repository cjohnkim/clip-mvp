#!/usr/bin/env python3
"""
Update admin user credentials
"""

import os
import sys
import requests
import json

def update_admin():
    """Create/update admin user with specific credentials"""
    try:
        base_url = "https://clip-mvp-production.up.railway.app"
        admin_email = "cjohnkim@gmail.com"
        admin_password = "PinkyKim1"
        
        print("🔧 Updating Admin User")
        print("=" * 50)
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print()
        
        # Try to create admin account (might already exist)
        print("1. Creating admin account...")
        signup_response = requests.post(
            f"{base_url}/api/auth/signup",
            json={
                "email": admin_email,
                "password": admin_password,
                "first_name": "Admin"
            }
        )
        
        print(f"Signup status: {signup_response.status_code}")
        if signup_response.status_code == 201:
            print("✅ Admin account created successfully!")
        elif signup_response.status_code == 400:
            signup_data = signup_response.json()
            if "already exists" in signup_data.get('error', ''):
                print("ℹ️  Admin account already exists, that's okay!")
            else:
                print(f"❌ Signup error: {signup_data}")
        else:
            print(f"❌ Unexpected signup response: {signup_response.json()}")
        
        print()
        
        # Try to login with new credentials
        print("2. Testing login...")
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            json={
                "email": admin_email,
                "password": admin_password
            }
        )
        
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            jwt_token = login_data.get('access_token')
            print("✅ Login successful!")
            print(f"🔑 JWT Token: {jwt_token[:20]}...")
            
            # Test admin access
            print()
            print("3. Testing admin access...")
            admin_response = requests.get(
                f"{base_url}/api/admin/waitlist/list",
                headers={
                    'Authorization': f'Bearer {jwt_token}',
                    'Content-Type': 'application/json'
                }
            )
            
            print(f"Admin access status: {admin_response.status_code}")
            
            if admin_response.status_code == 200:
                admin_data = admin_response.json()
                print("✅ Admin access confirmed!")
                print(f"📊 Found {admin_data.get('total', 0)} waitlist users")
            elif admin_response.status_code == 403:
                print("❌ Admin access denied - need to set ADMIN_EMAIL environment variable")
                print(f"💡 Set ADMIN_EMAIL={admin_email} in your backend environment")
            else:
                print(f"❌ Admin access error: {admin_response.json()}")
                
        else:
            login_data = login_response.json()
            print(f"❌ Login failed: {login_data}")
            
            # If login failed, maybe we need to update password
            print()
            print("4. Account exists but password different - this is expected")
            print("⚠️  The account likely exists with a different password")
            print("💡 You can:")
            print("   - Use the existing password from create_admin.py: 'AdminPassword123!'")
            print("   - Or update the password via change-password API if you know current password")
        
        print()
        print("🎯 Summary:")
        print(f"📧 Admin email: {admin_email}")
        print(f"🔐 Expected password: {admin_password}")
        print(f"🌐 Admin URL: https://app.moneyclip.money/admin")
        print(f"🔧 Backend must have ADMIN_EMAIL={admin_email} environment variable")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    update_admin()