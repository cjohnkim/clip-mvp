from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from .base import db

class UserStreak(db.Model):
    """Track user's daily performance streaks"""
    __tablename__ = 'user_streaks'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Current streak data
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_training_days = Column(Integer, default=0)
    
    # Streak timing
    last_active_date = Column(Date, nullable=True)
    streak_start_date = Column(Date, nullable=True)
    longest_streak_start = Column(Date, nullable=True)
    longest_streak_end = Column(Date, nullable=True)
    
    # Performance tracking
    current_streak_average_score = Column(Float, default=0.0)
    longest_streak_average_score = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="streak_data")
    
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
        
        # Update averages (simplified)
        # TODO: Implement proper rolling average calculation
        
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
    
    id = Column(Integer, primary_key=True)
    
    # Achievement details
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(10), nullable=False)  # Emoji or icon identifier
    category = Column(String(50), nullable=False)  # streak, savings, performance, challenge, milestone
    tier = Column(String(20), nullable=False)  # bronze, silver, gold, platinum
    
    # Unlock criteria
    requirement_type = Column(String(50), nullable=False)  # streak_days, savings_amount, performance_score, etc.
    requirement_value = Column(Float, nullable=False)
    requirement_description = Column(String(200), nullable=False)
    
    # Achievement metadata
    points = Column(Integer, default=0)  # XP points awarded
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        return f'<Achievement {self.title} ({self.tier})>'


class UserAchievement(db.Model):
    """Track which achievements users have unlocked"""
    __tablename__ = 'user_achievements'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    achievement_id = Column(Integer, ForeignKey('achievements.id'), nullable=False)
    
    # Unlock details
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    progress_when_unlocked = Column(Float, nullable=True)  # Progress value when achieved
    
    # Social sharing
    is_shared = Column(Boolean, default=False)
    shared_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f'<UserAchievement user_id={self.user_id} achievement={self.achievement.title}>'


class DailyPerformance(db.Model):
    """Track daily performance scores and activities"""
    __tablename__ = 'daily_performance'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Performance data
    date = Column(Date, nullable=False)
    performance_score = Column(Float, nullable=False)  # 0-100 score
    
    # Spending data
    daily_target = Column(Float, nullable=False)
    actual_spent = Column(Float, nullable=False)
    amount_saved = Column(Float, nullable=False)  # Can be negative if overspent
    
    # Performance categorization
    performance_category = Column(String(20), nullable=False)  # excellent, good, neutral, poor, critical
    
    # Streak impact
    contributed_to_streak = Column(Boolean, default=False)
    streak_day_number = Column(Integer, nullable=True)  # Which day of streak this was
    
    # Additional metrics
    expenses_count = Column(Integer, default=0)
    largest_expense = Column(Float, nullable=True)
    categories_used = Column(JSON, nullable=True)  # List of expense categories
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="daily_performances")
    
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
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    
    # Level system
    current_level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    current_level_xp = Column(Integer, default=0)
    xp_to_next_level = Column(Integer, default=100)
    
    # Statistics
    achievements_unlocked = Column(Integer, default=0)
    total_days_trained = Column(Integer, default=0)
    total_saved = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="level_data")
    
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


# Add relationships to existing User model
# Note: This would be added to the existing User model
"""
class User(db.Model):
    # ... existing fields ...
    
    # Athletic system relationships
    streak_data = relationship("UserStreak", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user")
    daily_performances = relationship("DailyPerformance", back_populates="user")
    level_data = relationship("UserLevel", back_populates="user", uselist=False)
"""