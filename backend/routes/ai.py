"""
AI-powered endpoints for intelligent financial insights
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from claude_service import ClaudeService
from models_simple import db, Transaction, Account, RecurringItem
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Initialize Claude service
claude_service = ClaudeService()

@ai_bp.route('/status', methods=['GET'])
def get_ai_status():
    """Get AI service status"""
    return jsonify({
        'available': claude_service.is_available(),
        'provider': 'Claude AI',
        'features': [
            'transaction_categorization',
            'spending_analysis', 
            'daily_recommendations',
            'budget_optimization'
        ]
    })

@ai_bp.route('/categorize', methods=['POST'])
@jwt_required()
def categorize_transaction():
    """Categorize a transaction using AI"""
    try:
        data = request.get_json()
        
        description = data.get('description')
        amount = data.get('amount')
        merchant_name = data.get('merchant_name')
        
        if not description or amount is None:
            return jsonify({'error': 'description and amount are required'}), 400
        
        result = claude_service.categorize_transaction(
            description=description,
            amount=float(amount),
            merchant_name=merchant_name
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error categorizing transaction: {e}")
        return jsonify({'error': 'Failed to categorize transaction'}), 500

@ai_bp.route('/analyze-spending', methods=['GET'])
@jwt_required()
def analyze_spending():
    """Analyze user's spending patterns"""
    try:
        user_id = get_jwt_identity()
        days = request.args.get('days', 30, type=int)
        
        analysis = claude_service.analyze_spending_patterns(user_id, days)
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"Error analyzing spending: {e}")
        return jsonify({'error': 'Failed to analyze spending'}), 500

@ai_bp.route('/daily-recommendations', methods=['GET'])
@jwt_required()
def get_daily_recommendations():
    """Get personalized daily recommendations"""
    try:
        user_id = get_jwt_identity()
        
        recommendations = claude_service.get_daily_recommendations(user_id)
        
        return jsonify(recommendations)
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return jsonify({'error': 'Failed to get recommendations'}), 500

@ai_bp.route('/suggest-budgets', methods=['POST'])
@jwt_required()
def suggest_budgets():
    """Get AI-suggested budget adjustments"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        category_budgets = data.get('category_budgets', {})
        
        suggestions = claude_service.suggest_budget_adjustments(user_id, category_budgets)
        
        return jsonify(suggestions)
        
    except Exception as e:
        logger.error(f"Error suggesting budgets: {e}")
        return jsonify({'error': 'Failed to suggest budgets'}), 500

@ai_bp.route('/process-transaction', methods=['POST'])
@jwt_required()
def process_transaction_with_ai():
    """Process a new transaction with AI categorization and insights"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Required fields
        description = data.get('description')
        amount = data.get('amount')
        date_str = data.get('date')
        is_income = data.get('is_income', False)
        
        if not all([description, amount is not None, date_str]):
            return jsonify({'error': 'description, amount, and date are required'}), 400
        
        # Get AI categorization
        ai_result = claude_service.categorize_transaction(
            description=description,
            amount=float(amount),
            merchant_name=data.get('merchant_name')
        )
        
        # Create transaction with AI suggestions
        transaction = Transaction(
            user_id=user_id,
            description=description,
            amount=float(amount),
            date=datetime.strptime(date_str, '%Y-%m-%d').date(),
            category=ai_result.get('category', 'Other'),
            is_income=is_income,
            notes=ai_result.get('note', ''),
            account_id=data.get('account_id'),
            merchant_name=data.get('merchant_name')
        )
        
        db.session.add(transaction)
        
        # Check if this might be recurring
        if ai_result.get('recurring_likelihood', 0) > 0.7:
            # Flag for user review
            transaction.pending_recurring_review = True
        
        db.session.commit()
        
        # Get updated daily recommendations
        recommendations = claude_service.get_daily_recommendations(user_id)
        
        return jsonify({
            'transaction': transaction.to_dict(),
            'ai_categorization': ai_result,
            'daily_impact': recommendations.get('suggested_daily_limit', 0) - abs(float(amount)) if not is_income else 0,
            'should_review_recurring': ai_result.get('recurring_likelihood', 0) > 0.7
        })
        
    except Exception as e:
        logger.error(f"Error processing transaction with AI: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to process transaction'}), 500

@ai_bp.route('/approve-suggestions', methods=['POST'])
@jwt_required()
def approve_ai_suggestions():
    """Approve or modify AI suggestions for transactions"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        transaction_id = data.get('transaction_id')
        approved_category = data.get('category')
        approved_recurring = data.get('is_recurring', False)
        recurring_frequency = data.get('recurring_frequency')
        
        if not transaction_id:
            return jsonify({'error': 'transaction_id is required'}), 400
        
        # Update transaction
        transaction = Transaction.query.filter_by(
            id=transaction_id,
            user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Update category if provided
        if approved_category:
            transaction.category = approved_category
        
        # Create recurring transaction if approved
        if approved_recurring and recurring_frequency:
            recurring = RecurringItem(
                user_id=user_id,
                description=transaction.description,
                amount=transaction.amount,
                category=transaction.category,
                frequency=recurring_frequency,
                next_date=transaction.date,
                is_income=transaction.is_income,
                is_active=True
            )
            db.session.add(recurring)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict(),
            'recurring_created': approved_recurring
        })
        
    except Exception as e:
        logger.error(f"Error approving AI suggestions: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to approve suggestions'}), 500