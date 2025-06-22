#!/usr/bin/env python3
"""
Run database migration to add admin role
"""

import requests
import json

def run_migration():
    """Run the database migration to add admin role"""
    try:
        base_url = "https://clip-mvp-production.up.railway.app"
        admin_email = "cjohnkim@gmail.com"
        
        print("🔧 Running Database Migration")
        print("=" * 50)
        
        # First verify current state
        print("1. Checking current admin setup...")
        verify_response = requests.get(
            f"{base_url}/api/migration/verify-admin",
            params={'email': admin_email}
        )
        
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            print(f"✓ Column exists: {verify_data.get('column_exists')}")
            print(f"✓ User exists: {verify_data.get('user_exists')}")
            if verify_data.get('user_info'):
                user_info = verify_data['user_info']
                print(f"✓ Current admin status: {user_info.get('is_admin')}")
        
        print()
        print("2. Running migration...")
        
        # Run the migration
        migration_response = requests.post(
            f"{base_url}/api/migration/add-admin-column",
            headers={
                'X-Migration-Key': 'dev-migration-key-123',  # This should match backend
                'Content-Type': 'application/json'
            },
            json={
                'admin_email': admin_email
            }
        )
        
        print(f"Migration status: {migration_response.status_code}")
        
        if migration_response.status_code == 200:
            migration_data = migration_response.json()
            print("✅ Migration completed successfully!")
            print(f"📊 Column added: {migration_data.get('column_added')}")
            print(f"🛡️  Admin role set: {migration_data.get('admin_set')}")
            
            if migration_data.get('user_info'):
                user_info = migration_data['user_info']
                print(f"📧 Email: {user_info.get('email')}")
                print(f"👤 Name: {user_info.get('first_name')}")
                print(f"🔐 Admin: {user_info.get('is_admin')}")
                print(f"📅 Created: {user_info.get('created_at')}")
        else:
            migration_data = migration_response.json()
            print(f"❌ Migration failed: {migration_data}")
        
        print()
        print("3. Testing login with admin privileges...")
        
        # Test login
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
            print(f"🛡️  Admin status in login response: {is_admin}")
            
            if is_admin:
                # Test admin access
                jwt_token = login_data.get('access_token')
                admin_response = requests.get(
                    f"{base_url}/api/admin/waitlist/list",
                    headers={
                        'Authorization': f'Bearer {jwt_token}',
                        'Content-Type': 'application/json'
                    }
                )
                
                print(f"Admin API access: {admin_response.status_code}")
                if admin_response.status_code == 200:
                    admin_data = admin_response.json()
                    print(f"✅ Admin access working! Found {admin_data.get('total', 0)} waitlist users")
                else:
                    print(f"❌ Admin access failed: {admin_response.json()}")
            else:
                print("⚠️  Admin status not detected in login response")
                
        else:
            login_data = login_response.json()
            print(f"❌ Login failed: {login_data}")
        
        print()
        print("🎯 Summary:")
        print(f"📧 Admin email: {admin_email}")
        print(f"🔐 Password: PinkyKim1")
        print(f"🌐 Admin URL: https://app.moneyclip.money/admin")
        print(f"📱 Dashboard URL: https://app.moneyclip.money/dashboard")
        print("🔄 Dual access: Regular user dashboard + Admin panel")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    run_migration()