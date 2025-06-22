"""
Money Clip MVP - Simplified Database Models

Core functionality only:
1. User authentication
2. Account management (checking, savings, credit)
3. Transaction tracking (income/expense)
4. Simple budget calculation
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import hashlib
import os
import uuid

# Create a placeholder db instance that will be initialized in app.py
db = SQLAlchemy()

class User(db.Model):
    """User account model - simplified"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('Account', backref='user', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        salt = os.urandom(32)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        self.password_hash = salt.hex() + password_hash.hex()
    
    def check_password(self, password):
        """Check password against hash"""
        if not self.password_hash or len(self.password_hash) < 64:
            return False
        
        salt = bytes.fromhex(self.password_hash[:64])
        stored_hash = self.password_hash[64:]
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        
        return password_hash.hex() == stored_hash
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Account(db.Model):
    """User bank account model - simplified"""
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Basic account info
    name = db.Column(db.String(100), nullable=False)  # "Chase Checking", "Savings", etc.
    account_type = db.Column(db.String(20), nullable=False, default='checking')  # checking, savings, credit
    current_balance = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    
    # Optional integration fields
    plaid_account_id = db.Column(db.String(255), nullable=True)  # For Plaid integration
    institution_name = db.Column(db.String(100), nullable=True)  # "Chase", "Wells Fargo", etc.
    
    # Flags
    is_active = db.Column(db.Boolean, default=True)
    include_in_total = db.Column(db.Boolean, default=True)  # Include in daily allowance calculation
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'account_type': self.account_type,
            'current_balance': float(self.current_balance),
            'institution_name': self.institution_name,
            'is_active': self.is_active,
            'include_in_total': self.include_in_total,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Transaction(db.Model):
    """Transaction model - income and expenses"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)  # Optional
    
    # Transaction details
    description = db.Column(db.String(500), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)  # Positive for income, negative for expenses
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=True)  # "Groceries", "Salary", "Rent", etc.
    
    # Classification
    is_income = db.Column(db.Boolean, default=False)
    is_recurring = db.Column(db.Boolean, default=False)
    
    # Optional integration fields
    plaid_transaction_id = db.Column(db.String(255), unique=True, nullable=True)
    merchant_name = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'description': self.description,
            'amount': float(self.amount),
            'date': self.date.isoformat() if self.date else None,
            'category': self.category,
            'is_income': self.is_income,
            'is_recurring': self.is_recurring,
            'merchant_name': self.merchant_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RecurringItem(db.Model):
    """Recurring income and expenses for prediction"""
    __tablename__ = 'recurring_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Recurring item details
    description = db.Column(db.String(500), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), nullable=True)
    is_income = db.Column(db.Boolean, default=False)
    
    # Recurrence settings
    frequency = db.Column(db.String(20), nullable=False)  # 'weekly', 'bi-weekly', 'monthly', 'yearly'
    next_date = db.Column(db.Date, nullable=False)
    day_of_month = db.Column(db.Integer, nullable=True)  # For monthly items (e.g., 15th)
    day_of_week = db.Column(db.Integer, nullable=True)   # For weekly items (0=Monday, 6=Sunday)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'description': self.description,
            'amount': float(self.amount),
            'category': self.category,
            'is_income': self.is_income,
            'frequency': self.frequency,
            'next_date': self.next_date.isoformat() if self.next_date else None,
            'day_of_month': self.day_of_month,
            'day_of_week': self.day_of_week,
            'is_active': self.is_active
        }

class Budget(db.Model):
    """Simple budget calculation cache"""
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Calculated values
    total_balance = db.Column(db.Numeric(10, 2), nullable=False)
    monthly_income = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    monthly_expenses = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    daily_allowance = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    
    # Settings
    next_income_date = db.Column(db.Date, nullable=True)  # Next payday
    calculation_mode = db.Column(db.String(20), default='monthly')  # 'monthly', 'payday'
    
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'total_balance': float(self.total_balance),
            'monthly_income': float(self.monthly_income),
            'monthly_expenses': float(self.monthly_expenses),
            'daily_allowance': float(self.daily_allowance),
            'next_income_date': self.next_income_date.isoformat() if self.next_income_date else None,
            'calculation_mode': self.calculation_mode,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None
        }

# Keep existing models for backward compatibility during migration
class Waitlist(db.Model):
    """Waitlist for user signups"""
    __tablename__ = 'waitlist'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    name = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='pending', index=True)
    source = db.Column(db.String(100), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    user_metadata = db.Column(db.Text, nullable=True)
    
    # Approval tracking
    approved_at = db.Column(db.DateTime, nullable=True)
    approved_by = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Waitlist email={self.email} status={self.status}>'

class SignupToken(db.Model):
    """Tokenized signup URLs for waitlist-approved users"""
    __tablename__ = 'signup_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    token = db.Column(db.String(32), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<SignupToken email={self.email} token={self.token[:8]}... expires={self.expires_at}>'