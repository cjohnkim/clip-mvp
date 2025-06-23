#!/usr/bin/env python3
"""
Test Plaid integration setup
Run this script to verify your Plaid credentials are working
"""

import os
import sys
from plaid_service import PlaidService
from plaid_config import PlaidConfig

def test_plaid_setup():
    """Test Plaid configuration and service"""
    
    print("🔍 Testing Plaid Integration Setup...")
    print("=" * 50)
    
    # Test configuration
    config = PlaidConfig()
    env_info = config.get_environment_info()
    
    print(f"📊 Environment: {env_info['environment']}")
    print(f"🔧 Client ID: {env_info['client_id']}")
    print(f"✅ Valid Config: {env_info['is_valid']}")
    print(f"💬 Message: {env_info['validation_message']}")
    print(f"🌍 Products: {env_info['products']}")
    print(f"🇺🇸 Countries: {env_info['country_codes']}")
    
    print("\n" + "=" * 50)
    
    # Test service
    service = PlaidService()
    status = service.get_status()
    
    print(f"🚀 Service Available: {service.is_available()}")
    print(f"🎭 Demo Mode: {status.get('demo_mode', False)}")
    
    if service.is_available():
        print("\n✅ SUCCESS: Plaid is properly configured!")
        print("🎯 You can now connect real bank accounts")
        
        # Test link token creation (mock user)
        try:
            result = service.create_link_token(user_id=1)
            print(f"🔗 Link Token: {result['link_token'][:20]}...")
            print("💯 Link token creation successful!")
            
        except Exception as e:
            print(f"⚠️  Link token test failed: {e}")
            
    else:
        print("\n⚙️  DEMO MODE: Using mock responses")
        print("📋 To enable real Plaid:")
        print("   1. Get credentials from https://dashboard.plaid.com")
        print("   2. Set environment variables:")
        print("      export PLAID_CLIENT_ID=your_client_id")
        print("      export PLAID_SECRET=your_secret")
        print("   3. Restart server")
    
    print("\n" + "=" * 50)
    
    # Environment variable check
    print("🔐 Environment Variables:")
    plaid_vars = {
        'PLAID_ENV': os.getenv('PLAID_ENV', 'Not set'),
        'PLAID_CLIENT_ID': 'Set' if os.getenv('PLAID_CLIENT_ID') else 'Not set',
        'PLAID_SECRET': 'Set' if os.getenv('PLAID_SECRET') else 'Not set',
    }
    
    for var, value in plaid_vars.items():
        status_icon = "✅" if value not in ['Not set'] else "❌"
        print(f"   {status_icon} {var}: {value}")
    
    return service.is_available()

if __name__ == "__main__":
    success = test_plaid_setup()
    sys.exit(0 if success else 1)