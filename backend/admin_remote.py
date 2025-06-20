#!/usr/bin/env python3
"""
Remote admin tool that works with production API endpoints
Usage: python admin_remote.py list
"""

import requests
import json
import sys
import argparse

# Production API base URL
API_BASE = "https://clip-mvp-production.up.railway.app/api"

def list_users():
    """List waitlist users via API"""
    try:
        # This would need a list endpoint, let's create a simple one
        print("📋 To list users, we need to create a list endpoint in the API")
        print("For now, you can check your Supabase dashboard directly")
        print("Go to: https://supabase.com → Your Project → Table Editor → waitlist")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def create_user(email, name):
    """Create user via waitlist API"""
    try:
        response = requests.post(f"{API_BASE}/waitlist/join", json={
            "email": email,
            "name": name,
            "source": "admin"
        })
        
        if response.status_code == 200:
            print(f"✅ Created user: {email} ({name})")
            return True
        else:
            data = response.json()
            print(f"❌ Error: {data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def approve_user(email):
    """This requires JWT token - use Supabase dashboard instead"""
    print("🔐 Approval requires admin authentication")
    print("For now, manually approve in Supabase:")
    print("1. Go to Supabase → Table Editor → waitlist")
    print(f"2. Find user: {email}")
    print("3. Edit the row:")
    print("   - status: 'approved'")
    print("   - approved_at: now()")
    print("   - approved_by: 'admin'")
    print("4. Then manually create signup token in signup_tokens table")

def main():
    parser = argparse.ArgumentParser(description="Money Clip Remote Admin Tool")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # List command
    subparsers.add_parser('list', help='List all waitlist users (via Supabase)')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create new waitlist user')
    create_parser.add_argument('email', help='User email address')
    create_parser.add_argument('name', help='User name')
    
    # Approve command
    approve_parser = subparsers.add_parser('approve', help='Instructions to approve user')
    approve_parser.add_argument('email', help='User email address')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    print(f"🔧 Money Clip Remote Admin Tool - {args.command.title()}")
    print("=" * 50)
    
    if args.command == 'list':
        list_users()
    elif args.command == 'create':
        create_user(args.email, args.name)
    elif args.command == 'approve':
        approve_user(args.email)

if __name__ == "__main__":
    main()