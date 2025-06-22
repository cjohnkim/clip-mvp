"""
Transaction management API routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from sqlalchemy import desc
from models_simple import db, Transaction, Account, User
import logging

logger = logging.getLogger(__name__)

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get user's transactions with optional filtering"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        category = request.args.get('category')
        is_income = request.args.get('is_income')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Transaction.query.filter_by(user_id=user_id)
        
        if category:
            query = query.filter(Transaction.category == category)
        
        if is_income is not None:
            query = query.filter(Transaction.is_income == (is_income.lower() == 'true'))
        
        if start_date:
            query = query.filter(Transaction.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        
        if end_date:
            query = query.filter(Transaction.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        
        # Order by date desc, paginate
        transactions = query.order_by(desc(Transaction.date)).limit(limit).offset(offset).all()
        
        return jsonify({
            'transactions': [t.to_dict() for t in transactions],
            'total': query.count()
        })
        
    except Exception as e:
        logger.error(f"Error getting transactions: {str(e)}")
        return jsonify({'error': 'Failed to get transactions'}), 500

@transactions_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    """Create a new transaction"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['description', 'amount', 'date', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse and validate data
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount format'}), 400
        
        try:
            transaction_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Convert amount to negative for expenses (positive for income)
        final_amount = amount if data.get('is_income', False) else -amount
        
        # Create transaction
        transaction = Transaction(
            user_id=user_id,
            description=data['description'].strip(),
            amount=final_amount,
            date=transaction_date,
            category=data['category'],
            is_income=data.get('is_income', False),
            is_recurring=data.get('is_recurring', False),
            recurrence_type=data.get('recurrence_type'),
            recurrence_interval=data.get('recurrence_interval', 1),
            notes=data.get('notes', '').strip() if data.get('notes') else None
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        logger.info(f"Created transaction: {transaction.description} for user {user_id}")
        
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating transaction: {str(e)}")
        return jsonify({'error': 'Failed to create transaction'}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """Update an existing transaction"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Find transaction
        transaction = Transaction.query.filter_by(
            id=transaction_id,
            user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Update fields
        if 'description' in data:
            transaction.description = data['description'].strip()
        
        if 'amount' in data:
            try:
                amount = float(data['amount'])
                if amount <= 0:
                    return jsonify({'error': 'Amount must be greater than 0'}), 400
                # Convert amount based on income/expense type
                is_income = data.get('is_income', transaction.is_income)
                transaction.amount = amount if is_income else -amount
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid amount format'}), 400
        
        if 'date' in data:
            try:
                transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if 'category' in data:
            transaction.category = data['category']
        
        if 'is_income' in data:
            transaction.is_income = data['is_income']
            # Adjust amount sign if income/expense type changed
            if transaction.amount > 0 and not transaction.is_income:
                transaction.amount = -transaction.amount
            elif transaction.amount < 0 and transaction.is_income:
                transaction.amount = -transaction.amount
        
        if 'is_recurring' in data:
            transaction.is_recurring = data['is_recurring']
        
        if 'recurrence_type' in data:
            transaction.recurrence_type = data['recurrence_type']
        
        if 'recurrence_interval' in data:
            transaction.recurrence_interval = data['recurrence_interval']
        
        if 'notes' in data:
            transaction.notes = data['notes'].strip() if data['notes'] else None
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating transaction: {str(e)}")
        return jsonify({'error': 'Failed to update transaction'}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    """Delete a transaction"""
    try:
        user_id = get_jwt_identity()
        
        # Find transaction
        transaction = Transaction.query.filter_by(
            id=transaction_id,
            user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        logger.info(f"Deleted transaction {transaction_id} for user {user_id}")
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting transaction: {str(e)}")
        return jsonify({'error': 'Failed to delete transaction'}), 500

@transactions_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get user's transaction categories"""
    try:
        user_id = get_jwt_identity()
        
        # Get distinct categories from user's transactions
        income_categories = db.session.query(Transaction.category).filter_by(
            user_id=user_id, is_income=True
        ).filter(Transaction.category.isnot(None)).distinct().all()
        
        expense_categories = db.session.query(Transaction.category).filter_by(
            user_id=user_id, is_income=False
        ).filter(Transaction.category.isnot(None)).distinct().all()
        
        return jsonify({
            'income_categories': [cat[0] for cat in income_categories],
            'expense_categories': [cat[0] for cat in expense_categories]
        })
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        return jsonify({'error': 'Failed to get categories'}), 500

@transactions_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Get transaction summary for dashboard"""
    try:
        user_id = get_jwt_identity()
        
        # Get current month summary
        today = date.today()
        start_of_month = today.replace(day=1)
        
        # Current month income
        month_income = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.is_income == True,
            Transaction.date >= start_of_month,
            Transaction.date <= today
        ).scalar() or 0
        
        # Current month expenses (convert to positive)
        month_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.is_income == False,
            Transaction.date >= start_of_month,
            Transaction.date <= today
        ).scalar() or 0
        month_expenses = abs(float(month_expenses))  # Convert to positive
        
        # Recent transactions (last 10)
        recent_transactions = Transaction.query.filter_by(
            user_id=user_id
        ).order_by(desc(Transaction.date), desc(Transaction.created_at)).limit(10).all()
        
        return jsonify({
            'month_income': float(month_income),
            'month_expenses': month_expenses,
            'recent_transactions': [t.to_dict() for t in recent_transactions]
        })
        
    except Exception as e:
        logger.error(f"Error getting transaction summary: {str(e)}")
        return jsonify({'error': 'Failed to get transaction summary'}), 500