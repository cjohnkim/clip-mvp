#!/usr/bin/env python3
"""
Quick test to check email functionality via API
"""

import requests
import json

def test_waitlist_signup(email, name):
    """Test waitlist signup"""
    try:
        response = requests.post(
            "https://clip-mvp-production.up.railway.app/api/waitlist/join",
            json={
                "email": email,
                "name": name,
                "source": "test"
            }
        )
        
        print(f"📧 Testing waitlist signup for: {email}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_approve_user(email, jwt_token):
    """Test user approval via admin API"""
    try:
        response = requests.post(
            f"https://clip-mvp-production.up.railway.app/api/admin/waitlist/approve/{email}",
            headers={
                'Authorization': f'Bearer {jwt_token}',
                'Content-Type': 'application/json'
            }
        )
        
        print(f"\n🔧 Testing approval for: {email}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Money Clip Email Test")
    print("=" * 50)
    
    # Test signup
    email = input("Enter email to test: ").strip()
    name = input("Enter name: ").strip()
    
    if test_waitlist_signup(email, name):
        print("\n✅ Waitlist signup successful!")
        
        # Test approval (requires JWT token)
        print("\nTo test approval, you need a JWT token:")
        print("1. Login at https://app.moneyclip.money/auth")
        print("2. Open dev tools → Application → Local Storage")
        print("3. Copy the 'access_token' value")
        
        jwt_token = input("\nEnter JWT token (or press Enter to skip): ").strip()
        
        if jwt_token:
            test_approve_user(email, jwt_token)
        else:
            print("Skipping approval test")
    
    print("\n💡 Next steps:")
    print("1. Check Railway dashboard for ADMIN_EMAIL variable")
    print("2. Verify SMTP credentials are set correctly")
    print("3. Check Railway logs for email sending errors")