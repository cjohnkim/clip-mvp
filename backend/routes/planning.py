"""
Money Clip MVP - Planning Routes

Routes for managing planned expenses, income, and accounts.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models_simple import db, Account, PlannedExpense, PlannedIncome, PaycheckSchedule
from datetime import datetime, date
from decimal import Decimal

planning_bp = Blueprint('planning', __name__)

# ===============================
# ACCOUNT MANAGEMENT
# ===============================

@planning_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    """Get user's accounts"""
    try:
        user_id = int(get_jwt_identity())
        accounts = Account.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'accounts': [account.to_dict() for account in accounts]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get accounts: {str(e)}'}), 500


@planning_bp.route('/accounts', methods=['POST'])
@jwt_required()
def create_account():
    """Create new account"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Account name is required'}), 400
        
        # If this is the first account, make it primary
        existing_accounts = Account.query.filter_by(user_id=user_id).count()
        is_primary = existing_accounts == 0 or data.get('is_primary', False)
        
        # If setting as primary, unset other primary accounts
        if is_primary:
            Account.query.filter_by(user_id=user_id, is_primary=True).update({'is_primary': False})
        
        account = Account(
            user_id=user_id,
            name=data['name'],
            current_balance=Decimal(str(data.get('current_balance', 0))),
            account_type=data.get('account_type', 'checking'),
            is_primary=is_primary
        )
        
        db.session.add(account)
        db.session.commit()
        
        return jsonify({
            'message': 'Account created successfully',
            'account': account.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create account: {str(e)}'}), 500


@planning_bp.route('/accounts/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    """Update account"""
    try:
        user_id = int(get_jwt_identity())
        account = Account.query.filter_by(id=account_id, user_id=user_id).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            account.name = data['name']
        if 'current_balance' in data:
            account.current_balance = Decimal(str(data['current_balance']))
        if 'account_type' in data:
            account.account_type = data['account_type']
        if 'is_primary' in data and data['is_primary']:
            # Unset other primary accounts
            Account.query.filter_by(user_id=user_id, is_primary=True).update({'is_primary': False})
            account.is_primary = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Account updated successfully',
            'account': account.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update account: {str(e)}'}), 500


# ===============================
# EXPENSE MANAGEMENT
# ===============================

@planning_bp.route('/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    """Get user's planned expenses"""
    try:
        user_id = int(get_jwt_identity())
        
        # Optional filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        include_paid = request.args.get('include_paid', 'false').lower() == 'true'
        
        query = PlannedExpense.query.filter_by(user_id=user_id)
        
        if not include_paid:
            query = query.filter_by(is_paid=False)
        
        if start_date:
            query = query.filter(PlannedExpense.due_date >= datetime.fromisoformat(start_date).date())
        
        if end_date:
            query = query.filter(PlannedExpense.due_date <= datetime.fromisoformat(end_date).date())
        
        expenses = query.order_by(PlannedExpense.due_date.asc()).all()
        
        return jsonify({
            'expenses': [expense.to_dict() for expense in expenses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get expenses: {str(e)}'}), 500


@planning_bp.route('/expenses', methods=['POST'])
@jwt_required()
def create_expense():
    """Create new planned expense"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('amount') or not data.get('due_date'):
            return jsonify({'error': 'Name, amount, and due_date are required'}), 400
        
        expense = PlannedExpense(
            user_id=user_id,
            name=data['name'],
            amount=Decimal(str(data['amount'])),
            due_date=datetime.fromisoformat(data['due_date']).date(),
            category=data.get('category'),
            is_recurring=data.get('is_recurring', False),
            recurrence_frequency=data.get('recurrence_frequency'),
            notes=data.get('notes')
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({
            'message': 'Expense created successfully',
            'expense': expense.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create expense: {str(e)}'}), 500


@planning_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    """Update planned expense"""
    try:
        user_id = int(get_jwt_identity())
        expense = PlannedExpense.query.filter_by(id=expense_id, user_id=user_id).first()
        
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            expense.name = data['name']
        if 'amount' in data:
            expense.amount = Decimal(str(data['amount']))
        if 'due_date' in data:
            expense.due_date = datetime.fromisoformat(data['due_date']).date()
        if 'category' in data:
            expense.category = data['category']
        if 'is_recurring' in data:
            expense.is_recurring = data['is_recurring']
        if 'recurrence_frequency' in data:
            expense.recurrence_frequency = data['recurrence_frequency']
        if 'is_paid' in data:
            expense.is_paid = data['is_paid']
        if 'notes' in data:
            expense.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Expense updated successfully',
            'expense': expense.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update expense: {str(e)}'}), 500


@planning_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    """Delete planned expense"""
    try:
        user_id = int(get_jwt_identity())
        expense = PlannedExpense.query.filter_by(id=expense_id, user_id=user_id).first()
        
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
        
        db.session.delete(expense)
        db.session.commit()
        
        return jsonify({
            'message': 'Expense deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete expense: {str(e)}'}), 500


# ===============================
# INCOME MANAGEMENT
# ===============================

@planning_bp.route('/income', methods=['GET'])
@jwt_required()
def get_income():
    """Get user's planned income"""
    try:
        user_id = int(get_jwt_identity())
        
        # Optional filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        include_received = request.args.get('include_received', 'false').lower() == 'true'
        
        query = PlannedIncome.query.filter_by(user_id=user_id)
        
        if not include_received:
            query = query.filter_by(is_received=False)
        
        if start_date:
            query = query.filter(PlannedIncome.expected_date >= datetime.fromisoformat(start_date).date())
        
        if end_date:
            query = query.filter(PlannedIncome.expected_date <= datetime.fromisoformat(end_date).date())
        
        income = query.order_by(PlannedIncome.expected_date.asc()).all()
        
        return jsonify({
            'income': [item.to_dict() for item in income]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get income: {str(e)}'}), 500


@planning_bp.route('/income', methods=['POST'])
@jwt_required()
def create_income():
    """Create new planned income"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('amount') or not data.get('expected_date'):
            return jsonify({'error': 'Name, amount, and expected_date are required'}), 400
        
        income = PlannedIncome(
            user_id=user_id,
            name=data['name'],
            amount=Decimal(str(data['amount'])),
            expected_date=datetime.fromisoformat(data['expected_date']).date(),
            source=data.get('source'),
            is_recurring=data.get('is_recurring', False),
            recurrence_frequency=data.get('recurrence_frequency'),
            notes=data.get('notes')
        )
        
        db.session.add(income)
        db.session.commit()
        
        return jsonify({
            'message': 'Income created successfully',
            'income': income.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create income: {str(e)}'}), 500


@planning_bp.route('/income/<int:income_id>', methods=['PUT'])
@jwt_required()
def update_income(income_id):
    """Update planned income"""
    try:
        user_id = int(get_jwt_identity())
        income = PlannedIncome.query.filter_by(id=income_id, user_id=user_id).first()
        
        if not income:
            return jsonify({'error': 'Income not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            income.name = data['name']
        if 'amount' in data:
            income.amount = Decimal(str(data['amount']))
        if 'expected_date' in data:
            income.expected_date = datetime.fromisoformat(data['expected_date']).date()
        if 'source' in data:
            income.source = data['source']
        if 'is_recurring' in data:
            income.is_recurring = data['is_recurring']
        if 'recurrence_frequency' in data:
            income.recurrence_frequency = data['recurrence_frequency']
        if 'is_received' in data:
            income.is_received = data['is_received']
        if 'notes' in data:
            income.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Income updated successfully',
            'income': income.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update income: {str(e)}'}), 500


@planning_bp.route('/income/<int:income_id>', methods=['DELETE'])
@jwt_required()
def delete_income(income_id):
    """Delete planned income"""
    try:
        user_id = int(get_jwt_identity())
        income = PlannedIncome.query.filter_by(id=income_id, user_id=user_id).first()
        
        if not income:
            return jsonify({'error': 'Income not found'}), 404
        
        db.session.delete(income)
        db.session.commit()
        
        return jsonify({
            'message': 'Income deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete income: {str(e)}'}), 500


# ===============================
# PAYCHECK SCHEDULE MANAGEMENT
# ===============================

@planning_bp.route('/paycheck-schedule', methods=['GET'])
@jwt_required()
def get_paycheck_schedule():
    """Get user's paycheck schedule"""
    try:
        user_id = int(get_jwt_identity())
        schedules = PaycheckSchedule.query.filter_by(user_id=user_id, is_active=True).all()
        
        return jsonify({
            'schedules': [schedule.to_dict() for schedule in schedules]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get paycheck schedule: {str(e)}'}), 500


@planning_bp.route('/paycheck-schedule', methods=['POST'])
@jwt_required()
def create_paycheck_schedule():
    """Create new paycheck schedule"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('amount') or not data.get('frequency') or not data.get('next_date'):
            return jsonify({'error': 'Amount, frequency, and next_date are required'}), 400
        
        schedule = PaycheckSchedule(
            user_id=user_id,
            name=data.get('name', 'Paycheck'),
            amount=Decimal(str(data['amount'])),
            frequency=data['frequency'],
            next_date=datetime.fromisoformat(data['next_date']).date(),
            day_of_month=data.get('day_of_month'),
            day_of_week=data.get('day_of_week')
        )
        
        db.session.add(schedule)
        db.session.commit()
        
        return jsonify({
            'message': 'Paycheck schedule created successfully',
            'schedule': schedule.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create paycheck schedule: {str(e)}'}), 500


@planning_bp.route('/paycheck-schedule/<int:schedule_id>', methods=['PUT'])
@jwt_required()
def update_paycheck_schedule(schedule_id):
    """Update paycheck schedule"""
    try:
        user_id = int(get_jwt_identity())
        schedule = PaycheckSchedule.query.filter_by(id=schedule_id, user_id=user_id).first()
        
        if not schedule:
            return jsonify({'error': 'Paycheck schedule not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            schedule.name = data['name']
        if 'amount' in data:
            schedule.amount = Decimal(str(data['amount']))
        if 'frequency' in data:
            schedule.frequency = data['frequency']
        if 'next_date' in data:
            schedule.next_date = datetime.fromisoformat(data['next_date']).date()
        if 'day_of_month' in data:
            schedule.day_of_month = data['day_of_month']
        if 'day_of_week' in data:
            schedule.day_of_week = data['day_of_week']
        if 'is_active' in data:
            schedule.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Paycheck schedule updated successfully',
            'schedule': schedule.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update paycheck schedule: {str(e)}'}), 500


@planning_bp.route('/accounts/<int:account_id>/balance', methods=['PUT'])
@jwt_required()
def update_account_balance(account_id):
    """Update account balance only"""
    try:
        user_id = int(get_jwt_identity())
        account = Account.query.filter_by(id=account_id, user_id=user_id).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        data = request.get_json()
        
        if 'current_balance' not in data:
            return jsonify({'error': 'current_balance is required'}), 400
        
        account.current_balance = Decimal(str(data['current_balance']))
        db.session.commit()
        
        return jsonify({
            'message': 'Account balance updated successfully',
            'account': account.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update account balance: {str(e)}'}), 500


@planning_bp.route('/accounts/primary/balance', methods=['PUT'])
@jwt_required()
def update_primary_account_balance():
    """Update primary account balance"""
    try:
        user_id = int(get_jwt_identity())
        account = Account.query.filter_by(user_id=user_id, is_primary=True).first()
        
        if not account:
            return jsonify({'error': 'No primary account found'}), 404
        
        data = request.get_json()
        
        if 'current_balance' not in data:
            return jsonify({'error': 'current_balance is required'}), 400
        
        account.current_balance = Decimal(str(data['current_balance']))
        db.session.commit()
        
        return jsonify({
            'message': 'Primary account balance updated successfully',
            'account': account.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update primary account balance: {str(e)}'}), 500