#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/chulhojkim/CascadeProjects/money-clip-mvp/backend')

from plaid_config import PlaidConfig

print("=== Plaid Configuration Debug ===")

# Check environment variables
print(f"PLAID_ENV: '{os.getenv('PLAID_ENV', 'not set')}'")
print(f"PLAID_CLIENT_ID: '{os.getenv('PLAID_CLIENT_ID', 'not set')}'")
print(f"PLAID_SECRET: {'SET' if os.getenv('PLAID_SECRET') else 'not set'}")
print(f"PLAID_SANDBOX_CLIENT_ID: '{os.getenv('PLAID_SANDBOX_CLIENT_ID', 'not set')}'")
print(f"PLAID_SANDBOX_SECRET: {'SET' if os.getenv('PLAID_SANDBOX_SECRET') else 'not set'}")

print(f"\nDetected environment: {PlaidConfig.ENVIRONMENT}")

try:
    client_id = PlaidConfig.get_client_id()
    secret = PlaidConfig.get_secret()
    print(f"Using client_id: {client_id}")
    print(f"Using secret: {'SET' if secret else 'not set'}")
    
    is_valid, message = PlaidConfig.validate_config()
    print(f"\nValidation result: {is_valid}")
    print(f"Validation message: {message}")
    
    env_info = PlaidConfig.get_environment_info()
    print(f"\nEnvironment info: {env_info}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()