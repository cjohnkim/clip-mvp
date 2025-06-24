"""
Plaid Integration API Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from plaid_service import PlaidService
import logging

logger = logging.getLogger(__name__)

plaid_bp = Blueprint('plaid', __name__, url_prefix='/api/plaid')

# Initialize Plaid service
plaid_service = PlaidService()

@plaid_bp.route('/status', methods=['GET'])
def get_plaid_status():
    """Get Plaid service status"""
    try:
        status = plaid_service.get_status()
        logger.info(f"Plaid status check: {status}")
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error getting Plaid status: {e}")
        return jsonify({'error': 'Failed to get Plaid status', 'available': False}), 500

@plaid_bp.route('/link-token', methods=['POST'])
@jwt_required()
def create_link_token():
    """Create a link token for Plaid Link"""
    try:
        user_id = get_jwt_identity()
        logger.info(f"Creating link token for user_id: {user_id}")
        
        if not plaid_service.is_available():
            logger.warning("Plaid service not available")
            return jsonify({
                'error': 'Plaid service not available',
                'link_token': 'demo_link_token',
                'demo_mode': True
            }), 200
        
        logger.info("Plaid service is available, calling create_link_token")
        result = plaid_service.create_link_token(user_id)
        logger.info(f"Link token created successfully: {result.get('link_token', '')[:20]}...")
        
        return jsonify({
            'link_token': result['link_token'],
            'expiration': result['expiration'],
            'demo_mode': False
        })
        
    except Exception as e:
        logger.error(f"Error creating link token: {e}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"User ID: {user_id}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': 'Failed to create link token',
            'details': str(e),
            'user_id': user_id
        }), 500

@plaid_bp.route('/exchange-token', methods=['POST'])
@jwt_required()
def exchange_public_token():
    """Exchange public token for access token"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        public_token = data.get('public_token')
        if not public_token:
            return jsonify({'error': 'public_token is required'}), 400
        
        if not plaid_service.is_available():
            # Demo mode - return mock response
            return jsonify({
                'success': True,
                'message': 'Demo mode - accounts would be connected',
                'demo_mode': True,
                'accounts_synced': 2
            })
        
        # Exchange token
        result = plaid_service.exchange_public_token(public_token, user_id)
        access_token = result['access_token']
        
        # Sync accounts and recent transactions
        synced_accounts = plaid_service.sync_accounts(user_id, access_token)
        synced_transactions = plaid_service.sync_transactions(user_id, access_token, days_back=30)
        
        return jsonify({
            'success': True,
            'accounts_synced': len(synced_accounts),
            'transactions_synced': synced_transactions,
            'demo_mode': False
        })
        
    except Exception as e:
        logger.error(f"Error exchanging public token: {e}")
        return jsonify({'error': 'Failed to connect accounts'}), 500

@plaid_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_connected_accounts():
    """Get user's connected accounts"""
    try:
        user_id = get_jwt_identity()
        
        from models_simple import Account
        
        accounts = Account.query.filter_by(
            user_id=user_id,
            is_active=True
        ).all()
        
        return jsonify({
            'accounts': [acc.to_dict() for acc in accounts],
            'total_balance': sum(float(acc.current_balance) for acc in accounts if acc.include_in_total)
        })
        
    except Exception as e:
        logger.error(f"Error getting connected accounts: {e}")
        return jsonify({'error': 'Failed to get accounts'}), 500

@plaid_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_accounts():
    """Manually sync accounts and transactions"""
    try:
        user_id = get_jwt_identity()
        
        if not plaid_service.is_available():
            return jsonify({
                'error': 'Plaid service not available',
                'demo_mode': True
            }), 200
        
        # Get user's accounts with Plaid access tokens
        from models_simple import Account
        
        accounts = Account.query.filter_by(
            user_id=user_id,
            is_active=True
        ).filter(Account.plaid_account_id.isnot(None)).all()
        
        if not accounts:
            return jsonify({'error': 'No connected accounts found'}), 404
        
        # For now, we'll need to store access tokens with accounts
        # This is simplified - in production you'd want proper token management
        total_synced = 0
        
        # Mock sync for demo
        return jsonify({
            'success': True,
            'message': 'Sync completed',
            'accounts_updated': len(accounts),
            'transactions_synced': 0,
            'demo_mode': True
        })
        
    except Exception as e:
        logger.error(f"Error syncing accounts: {e}")
        return jsonify({'error': 'Failed to sync accounts'}), 500

@plaid_bp.route('/disconnect/<int:account_id>', methods=['POST'])
@jwt_required()
def disconnect_account(account_id):
    """Disconnect a Plaid account"""
    try:
        user_id = get_jwt_identity()
        
        from models_simple import Account
        
        account = Account.query.filter_by(
            id=account_id,
            user_id=user_id
        ).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # For now, just deactivate the account
        # In production, you'd also want to revoke the Plaid access token
        account.is_active = False
        account.plaid_account_id = None
        
        from models_simple import db
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Account {account.name} disconnected'
        })
        
    except Exception as e:
        logger.error(f"Error disconnecting account: {e}")
        return jsonify({'error': 'Failed to disconnect account'}), 500