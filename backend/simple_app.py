#!/usr/bin/env python3
"""
Simple test app for Money Clip MVP
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = 'jwt-dev-secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

CORS(app)
jwt = JWTManager(app)

# Simple in-memory data for testing
users = {
    'cjohnkim@gmail.com': {
        'id': 1,
        'email': 'cjohnkim@gmail.com',
        'first_name': 'CJ',
        'password': 'SimpleClip123',
        'is_admin': False
    }
}

accounts = [
    {
        'id': 1,
        'name': 'Chase Freedom Checking',
        'account_type': 'checking',
        'current_balance': 3247.85,
        'institution_name': 'Chase',
        'include_in_total': True
    },
    {
        'id': 2,
        'name': 'Chase Savings',
        'account_type': 'savings',
        'current_balance': 12500.00,
        'institution_name': 'Chase',
        'include_in_total': False
    }
]

transactions = [
    {
        'id': 1,
        'description': 'Starbucks Coffee',
        'amount': -5.67,
        'date': '2025-06-22',
        'category': 'Coffee',
        'is_income': False,
        'is_recurring': False
    },
    {
        'id': 2,
        'description': 'Paycheck Deposit',
        'amount': 3200.00,
        'date': '2025-06-21',
        'category': 'Salary',
        'is_income': True,
        'is_recurring': True,
        'recurrence_type': 'monthly'
    },
    {
        'id': 3,
        'description': 'Monthly Rent',
        'amount': -2200.00,
        'date': '2025-06-01',
        'category': 'Housing',
        'is_income': False,
        'is_recurring': True,
        'recurrence_type': 'monthly'
    }
]

next_transaction_id = 4

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    
    user = users.get(email)
    if user and user['password'] == password:
        access_token = create_access_token(identity=user['id'])
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'first_name': user['first_name'],
                'is_admin': user['is_admin']
            }
        })
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    return jsonify({'transactions': transactions})

@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    global next_transaction_id
    data = request.get_json()
    
    new_transaction = {
        'id': next_transaction_id,
        'description': data['description'],
        'amount': float(data['amount']) if data.get('is_income') else -float(data['amount']),
        'date': data['date'],
        'category': data['category'],
        'is_income': data.get('is_income', False),
        'is_recurring': data.get('is_recurring', False),
        'recurrence_type': data.get('recurrence_type'),
        'notes': data.get('notes')
    }
    
    transactions.append(new_transaction)
    next_transaction_id += 1
    
    return jsonify({'success': True, 'transaction': new_transaction}), 201

@app.route('/api/transactions/summary', methods=['GET'])
@jwt_required()
def get_summary():
    today = date.today()
    start_of_month = today.replace(day=1)
    
    month_income = sum(t['amount'] for t in transactions 
                      if t['is_income'] and t['date'] >= start_of_month.isoformat())
    month_expenses = sum(abs(t['amount']) for t in transactions 
                        if not t['is_income'] and t['date'] >= start_of_month.isoformat())
    
    return jsonify({
        'month_income': month_income,
        'month_expenses': month_expenses,
        'recent_transactions': transactions[-10:]  # Last 10
    })

@app.route('/api/daily-allowance', methods=['GET'])
@jwt_required()
def get_daily_allowance():
    total_balance = sum(acc['current_balance'] for acc in accounts if acc['include_in_total'])
    
    # Simple calculation: balance divided by days remaining in month
    today = date.today()
    import calendar
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    days_remaining = days_in_month - today.day + 1
    
    daily_allowance = total_balance / days_remaining if days_remaining > 0 else 0
    
    return jsonify({
        'daily_allowance': round(daily_allowance, 2),
        'breakdown': {
            'total_balance': total_balance,
            'days_remaining_in_month': days_remaining,
            'basic_daily_allowance': round(daily_allowance, 2)
        },
        'accounts': accounts,
        'recommendations': ['You\'re on track for the month!']
    })

@app.route('/api/plaid/status', methods=['GET'])
def plaid_status():
    return jsonify({
        'available': False,
        'environment': {
            'is_sandbox': True,
            'demo_mode': True,
            'validation_message': 'Demo mode for testing'
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Money Clip MVP test server...")
    print("📧 Test login: cjohnkim@gmail.com / SimpleClip123")
    print("🌐 Frontend should connect to: http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)