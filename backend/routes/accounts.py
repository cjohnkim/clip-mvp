"""
Money Clip MVP - Accounts Routes

Handles account management including balance updates
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models_simple import db, User, Account
from datetime import datetime

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/balance', methods=['PUT'])
@jwt_required()
def update_balance():
    """Update user's total balance"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data or 'total_balance' not in data:
            return jsonify({'error': 'total_balance is required'}), 400
        
        total_balance = float(data['total_balance'])
        
        # For MVP: Create or update a default account with the total balance
        account = Account.query.filter_by(user_id=user_id, name='Total Balance').first()
        
        if not account:
            # Create a default account
            account = Account(
                user_id=user_id,
                name='Total Balance',
                account_type='checking',
                current_balance=total_balance,
                institution_name='Manual Entry',
                is_active=True,
                include_in_total=True
            )
            db.session.add(account)
        else:
            # Update existing account
            account.current_balance = total_balance
            account.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Balance updated successfully',
            'account': account.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid balance amount'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update balance: {str(e)}'}), 500


@accounts_bp.route('', methods=['GET'])
@jwt_required()
def get_accounts():
    """Get user's accounts"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        accounts = Account.query.filter_by(user_id=user_id, is_active=True).all()
        
        return jsonify({
            'accounts': [account.to_dict() for account in accounts],
            'total_balance': sum(acc.current_balance for acc in accounts if acc.include_in_total)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get accounts: {str(e)}'}), 500


@accounts_bp.route('', methods=['POST'])
@jwt_required()
def create_account():
    """Create a new account"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Account name is required'}), 400
        
        account = Account(
            user_id=user_id,
            name=data['name'],
            account_type=data.get('account_type', 'checking'),
            current_balance=float(data.get('current_balance', 0)),
            institution_name=data.get('institution_name', 'Manual Entry'),
            is_active=True,
            include_in_total=data.get('include_in_total', True)
        )
        
        db.session.add(account)
        db.session.commit()
        
        return jsonify({
            'message': 'Account created successfully',
            'account': account.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid balance amount'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create account: {str(e)}'}), 500