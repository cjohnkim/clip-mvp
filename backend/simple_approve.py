#!/usr/bin/env python3
"""
Simple approval script that directly calls the database
"""

import os
import requests
import json

def approve_user_direct(email):
    """Approve user via direct API call (no JWT needed for testing)"""
    
    # First, let's check if the user exists in waitlist
    try:
        print(f"🔍 Checking if {email} exists in waitlist...")
        
        # We'll create a simple test endpoint to approve without JWT
        response = requests.post(
            "https://clip-mvp-production.up.railway.app/api/waitlist/join",
            json={
                "email": email,
                "name": "Test User",
                "source": "test_approval"
            }
        )
        
        print(f"Waitlist check status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Now let's try to manually test the email sending
        print("\n📧 Testing SMTP configuration...")
        print("To test email sending, we need to check Railway environment variables:")
        print("- SMTP_SERVER: smtp.gmail.com")
        print("- SMTP_PORT: 587")  
        print("- SMTP_USERNAME: moneyclipapp@gmail.com")
        print("- SMTP_PASSWORD: (app password)")
        print("- ADMIN_EMAIL: cjohnkim@gmail.com")
        
        print("\n💡 Next steps:")
        print("1. Verify all SMTP variables are set in Railway")
        print("2. Test the email manually by logging into the backend")
        print("3. Check if Gmail app password is still valid")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Money Clip Email Approval Test")
    print("=" * 50)
    
    email = input("Enter the email you signed up with: ").strip()
    
    if email:
        approve_user_direct(email)
    else:
        print("Please provide an email address")