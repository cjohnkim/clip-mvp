#!/usr/bin/env python3
"""
Create admin user for testing
"""

import requests
import json

def create_admin_user():
    """Create admin user via API"""
    try:
        # Create admin account
        response = requests.post(
            "https://clip-mvp-production.up.railway.app/api/auth/signup",
            json={
                "email": "cjohnkim@gmail.com",
                "password": "AdminPassword123!",
                "first_name": "John"
            }
        )
        
        print(f"Admin creation status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Admin user created successfully!")
            
            # Now login to get JWT token
            login_response = requests.post(
                "https://clip-mvp-production.up.railway.app/api/auth/login",
                json={
                    "email": "cjohnkim@gmail.com",
                    "password": "AdminPassword123!"
                }
            )
            
            print(f"\nLogin status: {login_response.status_code}")
            login_data = login_response.json()
            print(f"Login response: {login_data}")
            
            if login_response.status_code == 200:
                jwt_token = login_data.get('access_token')
                print(f"\n🔑 JWT Token: {jwt_token}")
                
                # Test approval
                approval_response = requests.post(
                    "https://clip-mvp-production.up.railway.app/api/admin/waitlist/approve/cjohnkim+railway@gmail.com",
                    headers={
                        'Authorization': f'Bearer {jwt_token}',
                        'Content-Type': 'application/json'
                    }
                )
                
                print(f"\nApproval status: {approval_response.status_code}")
                print(f"Approval response: {approval_response.json()}")
                
                return True
        else:
            print(f"❌ Failed to create admin: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Creating Admin User and Testing Approval")
    print("=" * 50)
    create_admin_user()