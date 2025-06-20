from datetime import datetime, date

# This will be set when imported within app context
db = None

class UserStreak:
    """Track user's daily performance streaks"""
    pass

class Achievement:
    """Master list of all possible achievements"""
    pass

class UserAchievement:
    """Track which achievements users have unlocked"""
    pass

class DailyPerformance:
    """Track daily performance scores and activities"""
    pass

class UserLevel:
    """Track user experience points and level progression"""
    pass

def init_athletic_models(database):
    """Initialize athletic models with the database instance"""
    global db
    db = database
    
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
    
    # Return the classes for import
    return UserStreak, Achievement, UserAchievement, DailyPerformance, UserLevel