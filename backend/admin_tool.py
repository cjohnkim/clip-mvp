#!/usr/bin/env python3
"""
Comprehensive admin tool for waitlist user management

Usage Examples:
  python admin_tool.py list                                           # List all waitlist users
  python admin_tool.py create john@example.com "John Doe"            # Create new waitlist user
  python admin_tool.py approve john@example.com                      # Approve user (sends email)
  python admin_tool.py edit john@example.com --name "John Smith"     # Edit user name
  python admin_tool.py edit john@example.com --email john.smith@example.com # Edit email
  python admin_tool.py status john@example.com pending               # Change status back to pending
  python admin_tool.py status john@example.com approved              # Change status to approved
  python admin_tool.py delete john@example.com                       # Delete user from waitlist
  python admin_tool.py tokens                                        # List active signup tokens
"""

import sys
import os
import argparse
from datetime import datetime, timedelta
import secrets
import string
from sqlalchemy import text
from models import db
from app import app

def generate_signup_token():
    """Generate a secure random token for signup"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def list_users():
    """List all waitlist users"""
    with app.app_context():
        try:
            result = db.session.execute(text("""
                SELECT id, email, name, status, created_at, approved_at, source
                FROM waitlist 
                ORDER BY created_at DESC
            """)).fetchall()
            
            if not result:
                print("📋 No users in waitlist")
                return
            
            print(f"📋 Waitlist Users ({len(result)} total):")
            print("-" * 80)
            print(f"{'ID':<4} {'Email':<30} {'Name':<20} {'Status':<10} {'Created':<12}")
            print("-" * 80)
            
            for user in result:
                created = user.created_at.strftime('%Y-%m-%d') if user.created_at else 'N/A'
                print(f"{user.id:<4} {user.email:<30} {(user.name or 'N/A'):<20} {user.status:<10} {created:<12}")
                
        except Exception as e:
            print(f"❌ Error listing users: {e}")

def create_user(email, name, source="admin"):
    """Create a new waitlist user"""
    with app.app_context():
        try:
            # Check if user already exists
            existing = db.session.execute(
                text("SELECT id FROM waitlist WHERE email = :email"),
                {'email': email}
            ).fetchone()
            
            if existing:
                print(f"❌ User {email} already exists in waitlist")
                return False
            
            # Insert new user
            db.session.execute(text("""
                INSERT INTO waitlist (email, name, source, status, created_at)
                VALUES (:email, :name, :source, 'pending', NOW())
            """), {
                'email': email,
                'name': name,
                'source': source
            })
            
            db.session.commit()
            print(f"✅ Created user: {email} ({name})")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating user: {e}")
            return False

def approve_user(email):
    """Approve a waitlist user and create signup token"""
    with app.app_context():
        try:
            # Check if user exists
            result = db.session.execute(
                text("SELECT id, name, status FROM waitlist WHERE email = :email"),
                {'email': email}
            ).fetchone()
            
            if not result:
                print(f"❌ Email {email} not found in waitlist")
                return False
            
            if result.status == 'approved':
                print(f"⚠️  User {email} already approved")
                # Still show the token if it exists
                token_result = db.session.execute(
                    text("SELECT token FROM signup_tokens WHERE email = :email AND used_at IS NULL ORDER BY created_at DESC LIMIT 1"),
                    {'email': email}
                ).fetchone()
                if token_result:
                    print(f"🔗 Existing signup URL: https://app.moneyclip.money/auth?token={token_result.token}")
                return False
            
            # Generate token
            token = generate_signup_token()
            expires_at = datetime.utcnow() + timedelta(days=7)
            
            # Store token
            db.session.execute(text("""
                INSERT INTO signup_tokens (email, token, expires_at, created_at)
                VALUES (:email, :token, :expires_at, NOW())
            """), {
                'email': email,
                'token': token,
                'expires_at': expires_at
            })
            
            # Update waitlist status
            db.session.execute(text("""
                UPDATE waitlist 
                SET status = 'approved', approved_at = NOW(), approved_by = 'admin'
                WHERE email = :email
            """), {'email': email})
            
            db.session.commit()
            
            print(f"✅ Approved {email}")
            print(f"🔗 Signup URL: https://app.moneyclip.money/auth?token={token}")
            print(f"⏰ Expires: {expires_at}")
            print(f"📧 Email will be sent if SMTP is configured")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error approving user: {e}")
            return False

def edit_user(email, new_name=None, new_email=None):
    """Edit user name or email"""
    with app.app_context():
        try:
            # Check if user exists
            result = db.session.execute(
                text("SELECT id, name, email FROM waitlist WHERE email = :email"),
                {'email': email}
            ).fetchone()
            
            if not result:
                print(f"❌ Email {email} not found in waitlist")
                return False
            
            updates = []
            params = {'email': email}
            
            if new_name:
                updates.append("name = :new_name")
                params['new_name'] = new_name
                
            if new_email:
                # Check if new email already exists
                existing = db.session.execute(
                    text("SELECT id FROM waitlist WHERE email = :new_email AND email != :email"),
                    {'new_email': new_email, 'email': email}
                ).fetchone()
                
                if existing:
                    print(f"❌ Email {new_email} already exists")
                    return False
                    
                updates.append("email = :new_email")
                params['new_email'] = new_email
            
            if not updates:
                print("❌ No changes specified")
                return False
            
            # Update user
            query = f"UPDATE waitlist SET {', '.join(updates)} WHERE email = :email"
            db.session.execute(text(query), params)
            db.session.commit()
            
            print(f"✅ Updated user {email}")
            if new_name:
                print(f"   Name: {result.name} → {new_name}")
            if new_email:
                print(f"   Email: {email} → {new_email}")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error editing user: {e}")
            return False

def change_status(email, new_status):
    """Change user status"""
    valid_statuses = ['pending', 'approved', 'signed_up', 'rejected']
    
    if new_status not in valid_statuses:
        print(f"❌ Invalid status. Must be one of: {', '.join(valid_statuses)}")
        return False
    
    with app.app_context():
        try:
            # Check if user exists
            result = db.session.execute(
                text("SELECT id, status FROM waitlist WHERE email = :email"),
                {'email': email}
            ).fetchone()
            
            if not result:
                print(f"❌ Email {email} not found in waitlist")
                return False
            
            if result.status == new_status:
                print(f"⚠️  User {email} already has status: {new_status}")
                return False
            
            # Update status
            if new_status == 'pending':
                # Clear approval fields when reverting to pending
                db.session.execute(text("""
                    UPDATE waitlist 
                    SET status = :status, approved_at = NULL, approved_by = NULL
                    WHERE email = :email
                """), {'status': new_status, 'email': email})
            else:
                db.session.execute(text("""
                    UPDATE waitlist 
                    SET status = :status
                    WHERE email = :email
                """), {'status': new_status, 'email': email})
            
            db.session.commit()
            print(f"✅ Changed {email} status: {result.status} → {new_status}")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error changing status: {e}")
            return False

def delete_user(email):
    """Delete user from waitlist"""
    with app.app_context():
        try:
            # Check if user exists
            result = db.session.execute(
                text("SELECT id FROM waitlist WHERE email = :email"),
                {'email': email}
            ).fetchone()
            
            if not result:
                print(f"❌ Email {email} not found in waitlist")
                return False
            
            # Delete related signup tokens first
            db.session.execute(text("""
                DELETE FROM signup_tokens WHERE email = :email
            """), {'email': email})
            
            # Delete user
            db.session.execute(text("""
                DELETE FROM waitlist WHERE email = :email
            """), {'email': email})
            
            db.session.commit()
            print(f"✅ Deleted user: {email}")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error deleting user: {e}")
            return False

def list_tokens():
    """List active signup tokens"""
    with app.app_context():
        try:
            result = db.session.execute(text("""
                SELECT email, token, expires_at, used_at, created_at
                FROM signup_tokens 
                ORDER BY created_at DESC
            """)).fetchall()
            
            if not result:
                print("🎟️  No signup tokens found")
                return
            
            print(f"🎟️  Signup Tokens ({len(result)} total):")
            print("-" * 80)
            print(f"{'Email':<30} {'Status':<10} {'Expires':<12} {'Created':<12}")
            print("-" * 80)
            
            for token in result:
                status = "Used" if token.used_at else ("Expired" if token.expires_at < datetime.utcnow() else "Active")
                expires = token.expires_at.strftime('%Y-%m-%d') if token.expires_at else 'N/A'
                created = token.created_at.strftime('%Y-%m-%d') if token.created_at else 'N/A'
                print(f"{token.email:<30} {status:<10} {expires:<12} {created:<12}")
                
                if status == "Active":
                    print(f"   🔗 https://app.moneyclip.money/auth?token={token.token}")
                
        except Exception as e:
            print(f"❌ Error listing tokens: {e}")

def main():
    parser = argparse.ArgumentParser(description="Money Clip Waitlist Admin Tool")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # List command
    subparsers.add_parser('list', help='List all waitlist users')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create new waitlist user')
    create_parser.add_argument('email', help='User email address')
    create_parser.add_argument('name', help='User name')
    
    # Approve command
    approve_parser = subparsers.add_parser('approve', help='Approve user and send signup email')
    approve_parser.add_argument('email', help='User email address')
    
    # Edit command
    edit_parser = subparsers.add_parser('edit', help='Edit user information')
    edit_parser.add_argument('email', help='Current user email address')
    edit_parser.add_argument('--name', help='New name')
    edit_parser.add_argument('--email', dest='new_email', help='New email address')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Change user status')
    status_parser.add_argument('email', help='User email address')
    status_parser.add_argument('new_status', choices=['pending', 'approved', 'signed_up', 'rejected'], help='New status')
    
    # Delete command
    delete_parser = subparsers.add_parser('delete', help='Delete user from waitlist')
    delete_parser.add_argument('email', help='User email address')
    
    # Tokens command
    subparsers.add_parser('tokens', help='List signup tokens')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    print(f"🔧 Money Clip Admin Tool - {args.command.title()}")
    print("=" * 50)
    
    if args.command == 'list':
        list_users()
    elif args.command == 'create':
        create_user(args.email, args.name)
    elif args.command == 'approve':
        approve_user(args.email)
    elif args.command == 'edit':
        if not args.name and not args.new_email:
            print("❌ Must specify --name or --email")
            return
        edit_user(args.email, args.name, args.new_email)
    elif args.command == 'status':
        change_status(args.email, args.new_status)
    elif args.command == 'delete':
        delete_user(args.email)
    elif args.command == 'tokens':
        list_tokens()

if __name__ == "__main__":
    main()