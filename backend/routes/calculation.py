"""
Money Clip MVP - Calculation Routes

Routes for daily clip calculation and scenario testing.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.clip_calculator import ClipCalculator
from models import db
from datetime import datetime, date, timedelta

calculation_bp = Blueprint('calculation', __name__)

@calculation_bp.route('/daily-clip', methods=['GET'])
@jwt_required()
def get_daily_clip():
    """Get user's current daily spending capacity"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get calculation mode from query params
        mode = request.args.get('mode', 'next_paycheck')  # or 'end_of_month'
        
        # Initialize calculator with database connection
        calculator = ClipCalculator(db_connection=db)
        
        # Calculate daily clip
        result = calculator.calculate_daily_clip(str(user_id), mode)
        
        return jsonify({
            'success': True,
            'daily_clip': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to calculate daily clip: {str(e)}'}), 500


@calculation_bp.route('/scenario', methods=['POST'])
@jwt_required()
def test_scenario():
    """Test impact of a hypothetical expense"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('expense_amount'):
            return jsonify({'error': 'expense_amount is required'}), 400
        
        expense_amount = float(data['expense_amount'])
        scenario_date = data.get('scenario_date')  # Optional
        
        # Initialize calculator with database connection
        calculator = ClipCalculator(db_connection=db)
        
        # Test scenario
        result = calculator.test_scenario(str(user_id), expense_amount, scenario_date)
        
        return jsonify({
            'success': True,
            'scenario': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to test scenario: {str(e)}'}), 500


@calculation_bp.route('/cash-flow', methods=['GET'])
@jwt_required()
def get_cash_flow():
    """Get 30-day cash flow projection"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get parameters
        days = int(request.args.get('days', 30))
        start_date = request.args.get('start_date')
        
        if start_date:
            start_date = datetime.fromisoformat(start_date).date()
        else:
            start_date = date.today()
        
        # Initialize calculator
        calculator = ClipCalculator(db_connection=db)
        
        # Generate timeline data
        timeline = calculator.generate_cash_flow_timeline(str(user_id), start_date, days)
        
        return jsonify({
            'success': True,
            'timeline': timeline
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate cash flow: {str(e)}'}), 500


@calculation_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_financial_summary():
    """Get comprehensive financial summary"""
    try:
        user_id = int(get_jwt_identity())
        
        # Initialize calculator
        calculator = ClipCalculator(db_connection=db)
        
        # Get current daily clip
        daily_clip = calculator.calculate_daily_clip(str(user_id))
        
        # Get upcoming events (next 7 days)
        end_date = date.today() + timedelta(days=7)
        upcoming_expenses = calculator._get_upcoming_expenses(str(user_id), end_date)
        upcoming_income = calculator._get_expected_income(str(user_id), end_date)
        
        # Get breakdown details
        expense_breakdown = calculator._get_expense_breakdown(str(user_id), end_date)
        income_breakdown = calculator._get_income_breakdown(str(user_id), end_date)
        
        return jsonify({
            'success': True,
            'summary': {
                'daily_clip': daily_clip,
                'next_7_days': {
                    'total_expenses': upcoming_expenses,
                    'total_income': upcoming_income,
                    'net_change': upcoming_income - upcoming_expenses,
                    'expense_breakdown': expense_breakdown,
                    'income_breakdown': income_breakdown
                },
                'updated_at': datetime.now().isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get financial summary: {str(e)}'}), 500


@calculation_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_calculations():
    """Force refresh of all calculations"""
    try:
        user_id = int(get_jwt_identity())
        
        # Initialize calculator
        calculator = ClipCalculator(db_connection=db)
        
        # Recalculate everything
        daily_clip = calculator.calculate_daily_clip(str(user_id))
        
        return jsonify({
            'success': True,
            'message': 'Calculations refreshed successfully',
            'daily_clip': daily_clip,
            'refreshed_at': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to refresh calculations: {str(e)}'}), 500