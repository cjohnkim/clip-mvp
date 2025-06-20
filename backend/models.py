"""
Money Clip MVP - Database Models

SQLAlchemy models for minimal viable personal finance tracking.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import hashlib
import os

# Create a placeholder db instance that will be initialized in app.py
db = SQLAlchemy()

class User(db.Model):
    """User account model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('Account', backref='user', lazy=True, cascade='all, delete-orphan')
    planned_expenses = db.relationship('PlannedExpense', backref='user', lazy=True, cascade='all, delete-orphan')
    planned_income = db.relationship('PlannedIncome', backref='user', lazy=True, cascade='all, delete-orphan')
    paycheck_schedules = db.relationship('PaycheckSchedule', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        # Simple SHA256 hashing with salt for development
        salt = os.urandom(32)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        self.password_hash = salt.hex() + password_hash.hex()
    
    def check_password(self, password):
        """Check password against hash"""
        if not self.password_hash or len(self.password_hash) < 64:
            return False
        
        # Extract salt and hash
        salt = bytes.fromhex(self.password_hash[:64])
        stored_hash = self.password_hash[64:]
        
        # Hash the provided password with the same salt
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        
        return password_hash.hex() == stored_hash
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Account(db.Model):
    """User account/bank account model"""
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    current_balance = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    account_type = db.Column(db.String(20), nullable=False, default='checking')  # checking, savings, credit
    is_primary = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'current_balance': float(self.current_balance),
            'account_type': self.account_type,
            'is_primary': self.is_primary,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class PlannedExpense(db.Model):
    """Planned/upcoming expense model"""
    __tablename__ = 'planned_expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_frequency = db.Column(db.String(20), nullable=True)  # monthly, weekly, yearly
    is_paid = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'amount': float(self.amount),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'category': self.category,
            'is_recurring': self.is_recurring,
            'recurrence_frequency': self.recurrence_frequency,
            'is_paid': self.is_paid,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PlannedIncome(db.Model):
    """Planned/expected income model"""
    __tablename__ = 'planned_income'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    expected_date = db.Column(db.Date, nullable=False)
    source = db.Column(db.String(100), nullable=True)  # salary, freelance, etc.
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_frequency = db.Column(db.String(20), nullable=True)  # monthly, weekly, bi-weekly
    is_received = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'amount': float(self.amount),
            'expected_date': self.expected_date.isoformat() if self.expected_date else None,
            'source': self.source,
            'is_recurring': self.is_recurring,
            'recurrence_frequency': self.recurrence_frequency,
            'is_received': self.is_received,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PaycheckSchedule(db.Model):
    """Paycheck schedule model for regular income tracking"""
    __tablename__ = 'paycheck_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False, default='Paycheck')
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    frequency = db.Column(db.String(20), nullable=False)  # weekly, bi-weekly, monthly, semi-monthly
    next_date = db.Column(db.Date, nullable=False)
    day_of_month = db.Column(db.Integer, nullable=True)  # For monthly paychecks (e.g., 15th)
    day_of_week = db.Column(db.Integer, nullable=True)   # For weekly paychecks (0=Monday, 6=Sunday)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'amount': float(self.amount),
            'frequency': self.frequency,
            'next_date': self.next_date.isoformat() if self.next_date else None,
            'day_of_month': self.day_of_month,
            'day_of_week': self.day_of_week,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ==================== ATHLETIC MODELS ====================

class UserStreak(db.Model):
    """Track user's daily performance streaks"""
    __tablename__ = 'user_streaks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Current streak data
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    total_training_days = db.Column(db.Integer, default=0)
    
    # Streak timing
    last_active_date = db.Column(db.Date, nullable=True)
    streak_start_date = db.Column(db.Date, nullable=True)
    longest_streak_start = db.Column(db.Date, nullable=True)
    longest_streak_end = db.Column(db.Date, nullable=True)
    
    # Performance tracking
    current_streak_average_score = db.Column(db.Float, default=0.0)
    longest_streak_average_score = db.Column(db.Float, default=0.0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserStreak user_id={self.user_id} current={self.current_streak} longest={self.longest_streak}>'


class Achievement(db.Model):
    """Master list of all possible achievements"""
    __tablename__ = 'achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Achievement details
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    tier = db.Column(db.String(20), nullable=False)
    
    # Unlock criteria
    requirement_type = db.Column(db.String(50), nullable=False)
    requirement_value = db.Column(db.Float, nullable=False)
    requirement_description = db.Column(db.String(200), nullable=False)
    
    # Achievement metadata
    points = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Achievement {self.title} ({self.tier})>'


class UserAchievement(db.Model):
    """Track which achievements users have unlocked"""
    __tablename__ = 'user_achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    
    # Unlock details
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress_when_unlocked = db.Column(db.Float, nullable=True)
    
    # Social sharing
    is_shared = db.Column(db.Boolean, default=False)
    shared_at = db.Column(db.DateTime, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserAchievement user_id={self.user_id} achievement_id={self.achievement_id}>'


class DailyPerformance(db.Model):
    """Track daily performance scores and activities"""
    __tablename__ = 'daily_performance'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Performance data
    date = db.Column(db.Date, nullable=False)
    performance_score = db.Column(db.Float, nullable=False)
    
    # Spending data
    daily_target = db.Column(db.Float, nullable=False)
    actual_spent = db.Column(db.Float, nullable=False)
    amount_saved = db.Column(db.Float, nullable=False)
    
    # Performance categorization
    performance_category = db.Column(db.String(20), nullable=False)
    
    # Streak impact
    contributed_to_streak = db.Column(db.Boolean, default=False)
    streak_day_number = db.Column(db.Integer, nullable=True)
    
    # Additional metrics
    expenses_count = db.Column(db.Integer, default=0)
    largest_expense = db.Column(db.Float, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint on user_id + date
    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='unique_user_date_performance'),
    )
    
    def __repr__(self):
        return f'<DailyPerformance user_id={self.user_id} date={self.date} score={self.performance_score}>'


class UserLevel(db.Model):
    """Track user experience points and level progression"""
    __tablename__ = 'user_levels'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Level system
    current_level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    current_level_xp = db.Column(db.Integer, default=0)
    xp_to_next_level = db.Column(db.Integer, default=100)
    
    # Statistics
    achievements_unlocked = db.Column(db.Integer, default=0)
    total_days_trained = db.Column(db.Integer, default=0)
    total_saved = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserLevel user_id={self.user_id} level={self.current_level} xp={self.total_xp}>'