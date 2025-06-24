"""
Plaid Configuration for Money Clip MVP
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PlaidConfig:
    """Plaid configuration with environment switching"""
    
    # Environment detection
    ENVIRONMENT = os.getenv('PLAID_ENV', 'sandbox').lower()
    
    # Sandbox credentials (for development)
    SANDBOX_CLIENT_ID = os.getenv('PLAID_SANDBOX_CLIENT_ID', 'sandbox_demo_client_id')
    SANDBOX_SECRET = os.getenv('PLAID_SANDBOX_SECRET', 'sandbox_demo_secret')
    
    # Production credentials (from environment variables)
    PRODUCTION_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
    PRODUCTION_SECRET = os.getenv('PLAID_SECRET')
    
    # Development credentials (for development environment)
    DEVELOPMENT_CLIENT_ID = os.getenv('PLAID_DEV_CLIENT_ID')
    DEVELOPMENT_SECRET = os.getenv('PLAID_DEV_SECRET')
    
    @classmethod
    def get_client_id(cls):
        """Get appropriate client ID based on environment"""
        if cls.ENVIRONMENT == 'production':
            if not cls.PRODUCTION_CLIENT_ID:
                raise ValueError("PLAID_CLIENT_ID environment variable not set for production")
            return cls.PRODUCTION_CLIENT_ID
        elif cls.ENVIRONMENT == 'development':
            if not cls.DEVELOPMENT_CLIENT_ID:
                raise ValueError("PLAID_DEV_CLIENT_ID environment variable not set for development")
            return cls.DEVELOPMENT_CLIENT_ID
        else:
            return cls.SANDBOX_CLIENT_ID
    
    @classmethod
    def get_secret(cls):
        """Get appropriate secret based on environment"""
        if cls.ENVIRONMENT == 'production':
            if not cls.PRODUCTION_SECRET:
                raise ValueError("PLAID_SECRET environment variable not set for production")
            return cls.PRODUCTION_SECRET
        elif cls.ENVIRONMENT == 'development':
            if not cls.DEVELOPMENT_SECRET:
                raise ValueError("PLAID_DEV_SECRET environment variable not set for development")
            return cls.DEVELOPMENT_SECRET
        else:
            return cls.SANDBOX_SECRET
    
    @classmethod
    def get_environment(cls):
        """Get Plaid environment URL"""
        if cls.ENVIRONMENT == 'production':
            return 'https://production.plaid.com'
        elif cls.ENVIRONMENT == 'development':
            return 'https://development.plaid.com'
        else:
            return 'https://sandbox.plaid.com'
    
    @classmethod
    def get_configuration(cls):
        """Get Plaid API configuration"""
        try:
            from plaid.configuration import Configuration
            
            return Configuration(
                host=cls.get_environment(),
                api_key={
                    'clientId': cls.get_client_id(),
                    'secret': cls.get_secret()
                }
            )
        except ImportError:
            # Return dict if plaid library not installed
            return {
                'host': cls.get_environment(),
                'client_id': cls.get_client_id(),
                'secret': cls.get_secret()
            }
    
    # Products and country codes
    PRODUCTS = ['transactions', 'auth']  # transactions for history, auth for account info
    COUNTRY_CODES = ['US']
    
    # Webhook configuration
    WEBHOOK_URL = os.getenv('PLAID_WEBHOOK_URL')
    
    @classmethod
    def get_products(cls):
        """Get Plaid products list"""
        try:
            from plaid.model.products import Products
            
            product_map = {
                'transactions': Products('transactions'),
                'auth': Products('auth'),
            }
            
            return [product_map[p] for p in cls.PRODUCTS if p in product_map]
        except ImportError:
            # Fallback if plaid library not installed
            return cls.PRODUCTS
    
    @classmethod
    def get_country_codes(cls):
        """Get country codes list"""
        try:
            from plaid.model.country_code import CountryCode
            
            country_map = {
                'US': CountryCode('US'),
                'CA': CountryCode('CA'),
            }
            
            return [country_map[c] for c in cls.COUNTRY_CODES if c in country_map]
        except ImportError:
            # Fallback if plaid library not installed
            return cls.COUNTRY_CODES
    
    @classmethod
    def is_production(cls):
        """Check if running in production mode"""
        return cls.ENVIRONMENT == 'production'
    
    @classmethod
    def is_development(cls):
        """Check if running in development mode"""
        return cls.ENVIRONMENT == 'development'
    
    @classmethod
    def is_sandbox(cls):
        """Check if running in sandbox mode"""
        return cls.ENVIRONMENT == 'sandbox'
    
    @classmethod
    def validate_config(cls):
        """Validate configuration for current environment"""
        try:
            client_id = cls.get_client_id()
            secret = cls.get_secret()
            
            if not client_id or not secret:
                return False, "Missing client ID or secret"
            
            # Check for placeholder/demo credentials
            if client_id.startswith('sandbox_demo') or secret.startswith('sandbox_demo'):
                if cls.is_sandbox():
                    return False, "Demo/placeholder credentials - please set real sandbox credentials"
                else:
                    return False, "Demo/placeholder credentials detected"
            
            if cls.is_production() and (not cls.PRODUCTION_CLIENT_ID or not cls.PRODUCTION_SECRET):
                return False, "Production credentials not configured"
            
            return True, "Configuration valid"
            
        except Exception as e:
            return False, str(e)
    
    @classmethod
    def get_environment_info(cls):
        """Get current environment information"""
        is_valid, message = cls.validate_config()
        
        return {
            'environment': cls.ENVIRONMENT,
            'client_id': cls.get_client_id()[:10] + '...' if cls.get_client_id() else None,
            'products': cls.PRODUCTS,
            'country_codes': cls.COUNTRY_CODES,
            'webhook_url': cls.WEBHOOK_URL,
            'is_production': cls.is_production(),
            'is_development': cls.is_development(),
            'is_sandbox': cls.is_sandbox(),
            'is_valid': is_valid,
            'validation_message': message
        }