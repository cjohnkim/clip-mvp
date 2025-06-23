"""
Daily Allowance Calculation API
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
from sqlalchemy import func
from models_simple import db, Transaction, Account, User
import logging
import calendar

logger = logging.getLogger(__name__)

daily_allowance_bp = Blueprint('daily_allowance', __name__, url_prefix='/api/daily-allowance')

@daily_allowance_bp.route('', methods=['GET'])
@jwt_required()
def get_daily_allowance():
    """Calculate and return daily allowance with breakdown"""
    try:
        user_id = get_jwt_identity()
        today = date.today()
        
        # Get user's total balance from accounts
        total_balance = db.session.query(func.sum(Account.current_balance)).filter(
            Account.user_id == user_id,
            Account.is_active == True,
            Account.include_in_total == True
        ).scalar() or 0
        
        # Get current month stats
        start_of_month = today.replace(day=1)
        
        # Calculate month-to-date income
        month_income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.is_income == True,
            Transaction.date >= start_of_month,
            Transaction.date <= today
        ).scalar() or 0
        
        # Calculate month-to-date expenses (convert to positive)
        month_expenses = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.is_income == False,
            Transaction.date >= start_of_month,
            Transaction.date <= today
        ).scalar() or 0
        month_expenses = abs(float(month_expenses))
        
        # Days calculation
        days_in_month = calendar.monthrange(today.year, today.month)[1]
        days_remaining = days_in_month - today.day + 1  # Including today
        
        # Basic daily allowance calculation
        # If we have balance, divide by remaining days
        if total_balance > 0 and days_remaining > 0:
            basic_daily_allowance = float(total_balance) / days_remaining
        else:
            basic_daily_allowance = 0
        
        # For now, just use basic calculation
        daily_allowance = basic_daily_allowance
        
        # Enhanced calculation considering fixed expenses
        # Get recurring fixed expenses for the month
        fixed_monthly_expenses = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.is_income == False,
            Transaction.is_recurring == True,
            Transaction.recurrence_type == 'monthly'
        ).scalar() or 0
        fixed_monthly_expenses = abs(float(fixed_monthly_expenses))
        
        # Calculate expected monthly income from recurring income
        monthly_recurring_income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.is_income == True,
            Transaction.is_recurring == True,
            Transaction.recurrence_type == 'monthly'
        ).scalar() or 0
        
        # Adjust balance for remaining fixed expenses this month
        remaining_fixed_expenses = max(0, fixed_monthly_expenses - month_expenses)
        available_for_discretionary = max(0, float(total_balance) - remaining_fixed_expenses)
        
        # Safe-to-spend calculation
        if available_for_discretionary > 0 and days_remaining > 0:
            safe_daily_allowance = available_for_discretionary / days_remaining
        else:
            safe_daily_allowance = 0
        
        # Choose the more conservative calculation, but if no transactions exist, use basic
        if month_expenses == 0 and fixed_monthly_expenses == 0:
            # No transaction history, use basic calculation
            recommended_daily_allowance = basic_daily_allowance
        else:
            # Use more conservative calculation when we have transaction data
            recommended_daily_allowance = min(basic_daily_allowance, safe_daily_allowance)
        
        # Account information
        accounts = Account.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).all()
        
        accounts_data = []
        for account in accounts:
            accounts_data.append({
                'id': account.id,
                'name': account.name,
                'type': account.account_type,
                'balance': float(account.current_balance),
                'included_in_total': account.include_in_total
            })
        
        # Recent transactions for context
        recent_transactions = Transaction.query.filter_by(
            user_id=user_id
        ).order_by(
            Transaction.date.desc(),
            Transaction.created_at.desc()
        ).limit(5).all()
        
        return jsonify({
            'daily_allowance': round(recommended_daily_allowance, 2),
            'breakdown': {
                'total_balance': float(total_balance),
                'basic_daily_allowance': round(basic_daily_allowance, 2),
                'safe_daily_allowance': round(safe_daily_allowance, 2),
                'recommended_daily_allowance': round(recommended_daily_allowance, 2),
                'days_remaining_in_month': days_remaining,
                'month_income': float(month_income),
                'month_expenses': month_expenses,
                'fixed_monthly_expenses': fixed_monthly_expenses,
                'monthly_recurring_income': float(monthly_recurring_income),
                'available_for_discretionary': round(available_for_discretionary, 2)
            },
            'accounts': accounts_data,
            'recent_transactions': [t.to_dict() for t in recent_transactions],
            'calculation_date': today.isoformat(),
            'recommendations': _get_recommendations(
                recommended_daily_allowance, 
                float(total_balance), 
                month_expenses, 
                days_remaining
            )
        })
        
    except Exception as e:
        logger.error(f"Error calculating daily allowance: {str(e)}")
        return jsonify({'error': 'Failed to calculate daily allowance'}), 500

@daily_allowance_bp.route('/update-balance', methods=['POST'])
@jwt_required()
def update_balance():
    """Update account balance manually"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        account_id = data.get('account_id')
        new_balance = data.get('balance')
        
        if not account_id or new_balance is None:
            return jsonify({'error': 'account_id and balance are required'}), 400
        
        try:
            new_balance = float(new_balance)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid balance format'}), 400
        
        # Find and update account
        account = Account.query.filter_by(
            id=account_id,
            user_id=user_id
        ).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        old_balance = float(account.current_balance)
        account.current_balance = new_balance
        account.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        logger.info(f"Updated account {account_id} balance from {old_balance} to {new_balance} for user {user_id}")
        
        return jsonify({
            'success': True,
            'account': account.to_dict(),
            'old_balance': old_balance,
            'new_balance': new_balance
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating balance: {str(e)}")
        return jsonify({'error': 'Failed to update balance'}), 500

def _get_recommendations(daily_allowance, total_balance, month_expenses, days_remaining):
    """Generate personalized recommendations"""
    recommendations = []
    
    if daily_allowance < 10:
        recommendations.append("Consider reducing expenses this month")
    elif daily_allowance > 100:
        recommendations.append("You're in great shape! Consider saving the extra")
    
    if total_balance < 1000:
        recommendations.append("Focus on building an emergency fund")
    
    if month_expenses > total_balance * 0.5:
        recommendations.append("High spending this month - track carefully")
    
    if days_remaining > 20:
        recommendations.append("Plenty of time left in the month to optimize")
    elif days_remaining < 5:
        recommendations.append("End of month - time to be extra careful")
    
    if not recommendations:
        recommendations.append("You're on track! Keep monitoring daily.")
    
    return recommendations