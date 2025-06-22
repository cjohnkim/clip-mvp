#!/usr/bin/env python3
"""
Create sample user with realistic financial data
"""

import os
import sys
from datetime import datetime, date, timedelta
from models_simple import db, User, Account, Transaction

def create_sample_user():
    """Create cjohnkim@gmail.com with sample financial data"""
    
    try:
        # Create user
        user = User.query.filter_by(email='cjohnkim@gmail.com').first()
        if user:
            print("User already exists, updating data...")
        else:
            user = User(
                email='cjohnkim@gmail.com',
                first_name='CJ',
                is_admin=False
            )
            user.set_password('SimpleClip123')
            db.session.add(user)
            db.session.flush()  # Get user ID
            print("Created new user")
        
        # Create realistic accounts based on typical setup
        accounts_data = [
            {
                'name': 'Chase Freedom Checking',
                'account_type': 'checking',
                'current_balance': 3247.85,
                'institution_name': 'Chase',
                'include_in_total': True,
                'plaid_account_id': 'demo_chase_checking_001'
            },
            {
                'name': 'Chase Savings',
                'account_type': 'savings',
                'current_balance': 12500.00,
                'institution_name': 'Chase',
                'include_in_total': False,  # Don't include savings in daily calculations
                'plaid_account_id': 'demo_chase_savings_001'
            },
            {
                'name': 'Chase Sapphire Reserve',
                'account_type': 'credit',
                'current_balance': -1247.63,  # Credit card balance
                'institution_name': 'Chase',
                'include_in_total': True,
                'plaid_account_id': 'demo_chase_credit_001'
            }
        ]
        
        # Clear existing accounts for this user
        Account.query.filter_by(user_id=user.id).delete()
        
        created_accounts = []
        for acc_data in accounts_data:
            account = Account(
                user_id=user.id,
                name=acc_data['name'],
                account_type=acc_data['account_type'],
                current_balance=acc_data['current_balance'],
                institution_name=acc_data['institution_name'],
                include_in_total=acc_data['include_in_total'],
                plaid_account_id=acc_data['plaid_account_id'],
                is_active=True
            )
            db.session.add(account)
            created_accounts.append(account)
        
        db.session.flush()  # Get account IDs
        
        # Create realistic transaction history (last 60 days)
        checking_account = created_accounts[0]  # Chase checking
        credit_account = created_accounts[2]    # Chase credit
        
        # Clear existing transactions for this user
        Transaction.query.filter_by(user_id=user.id).delete()
        
        transactions_data = []
        
        # Monthly recurring income
        for i in range(2):  # Last 2 months
            pay_date = date.today().replace(day=15) - timedelta(days=30*i)
            transactions_data.append({
                'account': checking_account,
                'description': 'Salary Deposit - Direct Deposit',
                'amount': 6800.00,
                'date': pay_date,
                'category': 'Salary',
                'is_income': True,
                'is_recurring': True,
                'recurrence_type': 'monthly',
                'recurrence_interval': 1,
                'merchant_name': 'Employer Payroll',
                'plaid_transaction_id': f'demo_salary_{i}'
            })
        
        # Monthly recurring expenses
        recurring_expenses = [
            {'desc': 'Rent Payment', 'amount': -2200.00, 'category': 'Housing', 'day': 1},
            {'desc': 'Car Insurance', 'amount': -165.00, 'category': 'Insurance', 'day': 5},
            {'desc': 'Internet - Comcast', 'amount': -89.99, 'category': 'Internet', 'day': 8},
            {'desc': 'Phone - Verizon', 'amount': -85.00, 'category': 'Phone', 'day': 12},
            {'desc': 'Netflix Subscription', 'amount': -15.99, 'category': 'Entertainment', 'day': 15},
            {'desc': 'Spotify Premium', 'amount': -9.99, 'category': 'Entertainment', 'day': 18},
            {'desc': 'Gym Membership', 'amount': -49.99, 'category': 'Fitness', 'day': 20},
        ]
        
        for expense in recurring_expenses:
            for i in range(2):  # Last 2 months
                exp_date = date.today().replace(day=expense['day']) - timedelta(days=30*i)
                if exp_date <= date.today():  # Only past transactions
                    transactions_data.append({
                        'account': checking_account,
                        'description': expense['desc'],
                        'amount': expense['amount'],
                        'date': exp_date,
                        'category': expense['category'],
                        'is_income': False,
                        'is_recurring': True,
                        'recurrence_type': 'monthly',
                        'recurrence_interval': 1,
                        'plaid_transaction_id': f"demo_{expense['desc'].lower().replace(' ', '_')}_{i}"
                    })
        
        # Variable expenses (groceries, dining, gas, etc.)
        import random
        variable_expenses = [
            {'desc': 'Safeway', 'range': (45, 120), 'category': 'Groceries', 'freq': 7},
            {'desc': 'Starbucks', 'range': (4, 8), 'category': 'Coffee', 'freq': 3},
            {'desc': 'Shell Gas Station', 'range': (35, 55), 'category': 'Gas & Fuel', 'freq': 7},
            {'desc': 'Chipotle', 'range': (12, 18), 'category': 'Dining', 'freq': 10},
            {'desc': 'Target', 'range': (25, 85), 'category': 'Shopping', 'freq': 14},
            {'desc': 'Amazon', 'range': (15, 150), 'category': 'Shopping', 'freq': 5},
            {'desc': 'Uber Ride', 'range': (8, 25), 'category': 'Transportation', 'freq': 14},
        ]
        
        # Generate random variable expenses over last 60 days
        for days_ago in range(60):
            transaction_date = date.today() - timedelta(days=days_ago)
            
            for expense in variable_expenses:
                if random.randint(1, expense['freq']) == 1:  # Random frequency
                    amount = random.uniform(expense['range'][0], expense['range'][1])
                    
                    # Randomly assign to checking or credit
                    account = random.choice([checking_account, credit_account])
                    
                    transactions_data.append({
                        'account': account,
                        'description': expense['desc'],
                        'amount': -round(amount, 2),
                        'date': transaction_date,
                        'category': expense['category'],
                        'is_income': False,
                        'plaid_transaction_id': f"demo_var_{expense['desc'].lower().replace(' ', '_')}_{days_ago}"
                    })
        
        # Create all transactions
        for tx_data in transactions_data:
            transaction = Transaction(
                user_id=user.id,
                account_id=tx_data['account'].id,
                description=tx_data['description'],
                amount=tx_data['amount'],
                date=tx_data['date'],
                category=tx_data['category'],
                is_income=tx_data.get('is_income', False),
                is_recurring=tx_data.get('is_recurring', False),
                recurrence_type=tx_data.get('recurrence_type'),
                recurrence_interval=tx_data.get('recurrence_interval'),
                merchant_name=tx_data.get('merchant_name'),
                plaid_transaction_id=tx_data.get('plaid_transaction_id')
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        print(f"✅ Created user cjohnkim@gmail.com with:")
        print(f"   - 3 realistic bank accounts (checking, savings, credit)")
        print(f"   - {len(transactions_data)} transactions over 60 days")
        print(f"   - Recurring income and expenses")
        print(f"   - Variable spending patterns")
        print(f"   - Password: SimpleClip123")
        print(f"   - Plaid demo account IDs for testing")
        
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating sample user: {e}")
        return False

if __name__ == '__main__':
    from app import app
    
    print("🔄 Creating sample user with realistic financial data...")
    
    with app.app_context():
        if create_sample_user():
            print("\n✅ Sample user created successfully!")
            print("   You can now log in at https://app.moneyclip.money/")
            print("   Email: cjohnkim@gmail.com")
            print("   Password: SimpleClip123")
        else:
            print("\n❌ Failed to create sample user")
            sys.exit(1)