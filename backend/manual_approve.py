#!/usr/bin/env python3
"""
Manual approval script that works with production API
Usage: python manual_approve.py your-email@domain.com admin-jwt-token
"""

import sys
import requests
import json

def approve_user(email, jwt_token):
    """Approve user via admin API"""
    try:
        # Production API URL
        api_url = "https://clip-mvp-production.up.railway.app/api/admin/waitlist/approve"
        
        headers = {
            'Authorization': f'Bearer {jwt_token}',
            'Content-Type': 'application/json'
        }
        
        print(f"🔧 Approving user: {email}")
        print(f"📡 API URL: {api_url}/{email}")
        print()
        
        response = requests.post(f"{api_url}/{email}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ User approved successfully!")
            print(f"📧 Email sent: {data.get('email_sent', 'Unknown')}")
            print(f"🔗 Signup URL: {data.get('signup_url', 'N/A')}")
            print(f"⏰ Expires: {data.get('expires_at', 'N/A')}")
            return True
        else:
            try:
                error_data = response.json()
                print(f"❌ Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def get_admin_token():
    """Instructions to get admin JWT token"""
    print("📋 To get an admin JWT token:")
    print("1. Login to Money Clip app: https://app.moneyclip.money/auth")
    print("2. Open browser dev tools (F12)")
    print("3. Go to Application/Storage → Local Storage")
    print("4. Find 'access_token' key and copy its value")
    print("5. Use that token as the second argument")
    print()
    print("Note: Your account must match the ADMIN_EMAIL environment variable (cjohnkim@gmail.com)")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print("🔧 Money Clip Manual Approval Tool")
        print("=" * 50)
        get_admin_token()
        print("\nUsage: python manual_approve.py your-email@domain.com admin-jwt-token")
        sys.exit(0)
    
    if len(sys.argv) != 3:
        print("Usage: python manual_approve.py your-email@domain.com admin-jwt-token")
        print("Run without arguments for token instructions")
        sys.exit(1)
    
    email = sys.argv[1]
    token = sys.argv[2]
    
    print("🔧 Money Clip Manual Approval")
    print("=" * 50)
    
    success = approve_user(email, token)
    
    if not success:
        print("\n💡 Troubleshooting:")
        print("- Make sure your JWT token is valid and not expired")
        print("- Verify your account matches ADMIN_EMAIL in Railway")
        print("- Check that the email exists in the waitlist")
        print("- Ensure SMTP credentials are configured in Railway")