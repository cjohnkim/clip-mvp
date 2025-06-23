"""
Plaid Service for Money Clip MVP
Simplified version of Plaid integration for account connection and transaction sync
"""

import os
import logging
from datetime import datetime, timedelta
from models_simple import db, Account, Transaction, User
from plaid_config import PlaidConfig

logger = logging.getLogger(__name__)

class PlaidService:
    def __init__(self):
        """Initialize Plaid service with configuration"""
        self.config = PlaidConfig()
        
        # Validate configuration
        is_valid, message = self.config.validate_config()
        if not is_valid:
            logger.warning(f"Plaid configuration issue: {message}")
            self.client = None
        else:
            try:
                # Try to initialize Plaid client
                import plaid
                from plaid.api import plaid_api
                from plaid.configuration import Configuration
                from plaid.api_client import ApiClient
                
                configuration = self.config.get_configuration()
                api_client = ApiClient(configuration)
                self.client = plaid_api.PlaidApi(api_client)
                
                logger.info(f"Plaid service initialized: {self.config.get_environment_info()}")
                
            except ImportError:
                logger.warning("Plaid library not installed - running in mock mode")
                self.client = None
            except Exception as e:
                logger.error(f"Failed to initialize Plaid client: {e}")
                self.client = None
    
    def is_available(self):
        """Check if Plaid service is available"""
        return self.client is not None
    
    def create_link_token(self, user_id):
        """Create a link token for user authentication"""
        if not self.is_available():
            # Return mock data for development
            return {
                'link_token': 'mock_link_token_for_development',
                'expiration': (datetime.now() + timedelta(hours=4)).isoformat()
            }
        
        try:
            from plaid.model.link_token_create_request import LinkTokenCreateRequest
            from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
            
            request = LinkTokenCreateRequest(
                products=self.config.get_products(),
                client_name="Money Clip",
                country_codes=self.config.get_country_codes(),
                language='en',
                user=LinkTokenCreateRequestUser(client_user_id=str(user_id))
            )
            
            response = self.client.link_token_create(request)
            
            return {
                'link_token': response['link_token'],
                'expiration': response['expiration']
            }
            
        except Exception as e:
            logger.error(f"Error creating link token: {e}")
            raise
    
    def exchange_public_token(self, public_token, user_id):
        """Exchange public token for access token"""
        if not self.is_available():
            # Return mock data for development
            return {
                'access_token': f'mock_access_token_user_{user_id}',
                'item_id': f'mock_item_id_user_{user_id}'
            }
        
        try:
            from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
            
            request = ItemPublicTokenExchangeRequest(public_token=public_token)
            response = self.client.item_public_token_exchange(request)
            
            return {
                'access_token': response['access_token'],
                'item_id': response['item_id']
            }
            
        except Exception as e:
            logger.error(f"Error exchanging public token: {e}")
            raise
    
    def get_accounts(self, access_token):
        """Get user's accounts from Plaid"""
        if not self.is_available():
            # Return mock data for development
            return [
                {
                    'account_id': 'mock_checking_account',
                    'name': 'Demo Checking Account',
                    'type': 'depository',
                    'subtype': 'checking',
                    'balance': {'current': 2847.32, 'available': 2847.32},
                    'institution_name': 'Demo Bank'
                },
                {
                    'account_id': 'mock_savings_account',
                    'name': 'Demo Savings Account',
                    'type': 'depository',
                    'subtype': 'savings',
                    'balance': {'current': 5000.00, 'available': 5000.00},
                    'institution_name': 'Demo Bank'
                }
            ]
        
        try:
            from plaid.model.accounts_get_request import AccountsGetRequest
            
            request = AccountsGetRequest(access_token=access_token)
            response = self.client.accounts_get(request)
            
            accounts = []
            for account in response['accounts']:
                accounts.append({
                    'account_id': account['account_id'],
                    'name': account['name'],
                    'type': account['type'],
                    'subtype': account['subtype'],
                    'balance': {
                        'current': account['balances']['current'],
                        'available': account['balances']['available']
                    },
                    'institution_name': account.get('institution_name', 'Unknown')
                })
            
            return accounts
            
        except Exception as e:
            logger.error(f"Error getting accounts: {e}")
            raise
    
    def get_transactions(self, access_token, start_date=None, end_date=None):
        """Get transactions from Plaid"""
        if not self.is_available():
            # Return mock data for development
            from datetime import date
            
            if not start_date:
                start_date = date.today() - timedelta(days=30)
            if not end_date:
                end_date = date.today()
            
            return [
                {
                    'transaction_id': 'mock_txn_1',
                    'account_id': 'mock_checking_account',
                    'amount': -5.67,
                    'date': '2025-06-22',
                    'name': 'Starbucks Coffee',
                    'merchant_name': 'Starbucks',
                    'category': ['Food and Drink', 'Restaurants', 'Coffee Shop'],
                    'category_primary': 'Food and Drink'
                },
                {
                    'transaction_id': 'mock_txn_2',
                    'account_id': 'mock_checking_account',
                    'amount': -87.43,
                    'date': '2025-06-21',
                    'name': 'Grocery Store Purchase',
                    'merchant_name': 'Safeway',
                    'category': ['Shops', 'Supermarkets and Groceries'],
                    'category_primary': 'Shops'
                }
            ]
        
        try:
            from plaid.model.transactions_get_request import TransactionsGetRequest
            
            if not start_date:
                start_date = datetime.now().date() - timedelta(days=30)
            if not end_date:
                end_date = datetime.now().date()
            
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date
            )
            
            response = self.client.transactions_get(request)
            
            transactions = []
            for txn in response['transactions']:
                transactions.append({
                    'transaction_id': txn['transaction_id'],
                    'account_id': txn['account_id'],
                    'amount': -float(txn['amount']),  # Plaid uses positive for outflow
                    'date': txn['date'].isoformat(),
                    'name': txn['name'],
                    'merchant_name': txn.get('merchant_name'),
                    'category': txn.get('category', []),
                    'category_primary': txn.get('category', ['Other'])[0] if txn.get('category') else 'Other'
                })
            
            return transactions
            
        except Exception as e:
            logger.error(f"Error getting transactions: {e}")
            raise
    
    def sync_accounts(self, user_id, access_token):
        """Sync accounts from Plaid to local database"""
        try:
            plaid_accounts = self.get_accounts(access_token)
            
            user = User.query.get(user_id)
            if not user:
                raise ValueError("User not found")
            
            synced_accounts = []
            
            for plaid_account in plaid_accounts:
                # Check if account already exists
                existing_account = Account.query.filter_by(
                    user_id=user_id,
                    plaid_account_id=plaid_account['account_id']
                ).first()
                
                if existing_account:
                    # Update existing account
                    existing_account.current_balance = plaid_account['balance']['current']
                    existing_account.updated_at = datetime.utcnow()
                    synced_accounts.append(existing_account)
                else:
                    # Create new account
                    new_account = Account(
                        user_id=user_id,
                        name=plaid_account['name'],
                        account_type=plaid_account['subtype'] or plaid_account['type'],
                        current_balance=plaid_account['balance']['current'],
                        plaid_account_id=plaid_account['account_id'],
                        institution_name=plaid_account['institution_name'],
                        is_active=True,
                        include_in_total=True
                    )
                    db.session.add(new_account)
                    synced_accounts.append(new_account)
            
            db.session.commit()
            logger.info(f"Synced {len(synced_accounts)} accounts for user {user_id}")
            
            return synced_accounts
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error syncing accounts: {e}")
            raise
    
    def sync_transactions(self, user_id, access_token, days_back=30):
        """Sync transactions from Plaid to local database"""
        try:
            start_date = datetime.now().date() - timedelta(days=days_back)
            end_date = datetime.now().date()
            
            plaid_transactions = self.get_transactions(access_token, start_date, end_date)
            
            # Get user's accounts mapped by plaid_account_id
            user_accounts = {
                acc.plaid_account_id: acc for acc in 
                Account.query.filter_by(user_id=user_id).all()
                if acc.plaid_account_id
            }
            
            synced_count = 0
            
            for plaid_txn in plaid_transactions:
                # Skip if we don't have this account locally
                if plaid_txn['account_id'] not in user_accounts:
                    continue
                
                account = user_accounts[plaid_txn['account_id']]
                
                # Check if transaction already exists
                existing_txn = Transaction.query.filter_by(
                    plaid_transaction_id=plaid_txn['transaction_id']
                ).first()
                
                if existing_txn:
                    continue  # Skip duplicates
                
                # Create new transaction
                new_transaction = Transaction(
                    user_id=user_id,
                    account_id=account.id,
                    plaid_transaction_id=plaid_txn['transaction_id'],
                    description=plaid_txn['name'],
                    amount=plaid_txn['amount'],
                    date=datetime.strptime(plaid_txn['date'], '%Y-%m-%d').date(),
                    category=plaid_txn['category_primary'],
                    is_income=plaid_txn['amount'] > 0,
                    merchant_name=plaid_txn.get('merchant_name')
                )
                
                db.session.add(new_transaction)
                synced_count += 1
            
            db.session.commit()
            logger.info(f"Synced {synced_count} new transactions for user {user_id}")
            
            return synced_count
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error syncing transactions: {e}")
            raise
    
    def get_status(self):
        """Get service status"""
        return {
            'available': True,  # Always available (demo mode if no real credentials)
            'demo_mode': not self.is_available(),
            'environment': self.config.get_environment_info() if hasattr(self, 'config') else 'demo'
        }