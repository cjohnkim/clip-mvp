from datetime import datetime, date
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import db

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
    
    def is_active_today(self):
        """Check if streak is active (last active was yesterday or today)"""
        if not self.last_active_date:
            return False
        
        today = date.today()
        yesterday = date.fromordinal(today.toordinal() - 1)
        
        return self.last_active_date in [today, yesterday]
    
    def can_extend_today(self):
        """Check if user can extend streak today"""
        if not self.last_active_date:
            return True
        
        today = date.today()
        return self.last_active_date < today
    
    def extend_streak(self, performance_score):
        """Extend the current streak with today's performance"""
        today = date.today()
        
        if not self.can_extend_today():
            return False
        
        # If streak is broken (more than 1 day gap), reset
        if self.last_active_date and (today - self.last_active_date).days > 1:
            self.current_streak = 0
            self.streak_start_date = today
        
        # Extend streak
        if self.current_streak == 0:
            self.streak_start_date = today
        
        self.current_streak += 1
        self.total_training_days += 1
        self.last_active_date = today
        
        # Update longest streak
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
            self.longest_streak_start = self.streak_start_date
            self.longest_streak_end = today
        
        self.updated_at = datetime.utcnow()
        return True
    
    def break_streak(self):
        """Break the current streak"""
        self.current_streak = 0
        self.streak_start_date = None
        self.updated_at = datetime.utcnow()


class Achievement(db.Model):
    """Master list of all possible achievements"""
    __tablename__ = 'achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Achievement details
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(10), nullable=False)  # Emoji or icon identifier
    category = db.Column(db.String(50), nullable=False)  # streak, savings, performance, challenge, milestone
    tier = db.Column(db.String(20), nullable=False)  # bronze, silver, gold, platinum
    
    # Unlock criteria
    requirement_type = db.Column(db.String(50), nullable=False)  # streak_days, savings_amount, performance_score, etc.
    requirement_value = db.Column(db.Float, nullable=False)
    requirement_description = db.Column(db.String(200), nullable=False)
    
    # Achievement metadata
    points = db.Column(db.Integer, default=0)  # XP points awarded
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
    progress_when_unlocked = db.Column(db.Float, nullable=True)  # Progress value when achieved
    
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
    performance_score = db.Column(db.Float, nullable=False)  # 0-100 score
    
    # Spending data
    daily_target = db.Column(db.Float, nullable=False)
    actual_spent = db.Column(db.Float, nullable=False)
    amount_saved = db.Column(db.Float, nullable=False)  # Can be negative if overspent
    
    # Performance categorization
    performance_category = db.Column(db.String(20), nullable=False)  # excellent, good, neutral, poor, critical
    
    # Streak impact
    contributed_to_streak = db.Column(db.Boolean, default=False)
    streak_day_number = db.Column(db.Integer, nullable=True)  # Which day of streak this was
    
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
    
    @staticmethod
    def calculate_performance_score(target, spent):
        """Calculate 0-100 performance score based on spending vs target"""
        if target <= 0:
            return 50  # Neutral score if no target
        
        ratio = spent / target
        
        # Score calculation:
        # 0.0 ratio (spent nothing) = 100 score
        # 1.0 ratio (spent exactly target) = 50 score  
        # 2.0 ratio (spent double) = 0 score
        
        if ratio <= 1.0:
            # Linear scale from 100 (saved everything) to 50 (spent target)
            score = 100 - (ratio * 50)
        else:
            # Linear scale from 50 (spent target) to 0 (spent double)
            overspend_ratio = min(ratio - 1.0, 1.0)  # Cap at 1.0 (double spending)
            score = 50 - (overspend_ratio * 50)
        
        return max(0, min(100, score))
    
    @staticmethod
    def get_performance_category(score):
        """Get performance category from score"""
        if score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'neutral'
        elif score >= 20:
            return 'poor'
        else:
            return 'critical'


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
    
    def add_xp(self, points):
        """Add experience points and check for level up"""
        self.total_xp += points
        self.current_level_xp += points
        
        # Check for level up
        leveled_up = False
        while self.current_level_xp >= self.xp_to_next_level:
            self.current_level_xp -= self.xp_to_next_level
            self.current_level += 1
            self.xp_to_next_level = self.calculate_xp_for_level(self.current_level + 1)
            leveled_up = True
        
        self.updated_at = datetime.utcnow()
        return leveled_up
    
    @staticmethod
    def calculate_xp_for_level(level):
        """Calculate XP required to reach a specific level"""
        # Exponential growth: level^2.2 * 50
        return int((level ** 2.2) * 50)