from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.athletic import (
    UserStreak, Achievement, UserAchievement, 
    DailyPerformance, UserLevel
)
from ..models import User
from ..database import get_db

class AthleticService:
    """Service for managing the athletic/gaming aspects of financial training"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    # ==================== PERFORMANCE TRACKING ====================
    
    def record_daily_performance(self, user_id: int, target: float, spent: float, 
                               expenses_count: int = 0, categories: List[str] = None) -> Dict:
        """Record daily performance and update streaks/achievements"""
        
        today = date.today()
        
        # Calculate performance metrics
        amount_saved = target - spent
        performance_score = DailyPerformance.calculate_performance_score(target, spent)
        performance_category = DailyPerformance.get_performance_category(performance_score)
        
        # Check if performance already exists for today
        existing = self.db.query(DailyPerformance).filter(
            DailyPerformance.user_id == user_id,
            DailyPerformance.date == today
        ).first()
        
        if existing:
            # Update existing performance
            existing.performance_score = performance_score
            existing.daily_target = target
            existing.actual_spent = spent
            existing.amount_saved = amount_saved
            existing.performance_category = performance_category
            existing.expenses_count = expenses_count
            existing.categories_used = categories or []
            existing.updated_at = datetime.utcnow()
            performance = existing
        else:
            # Create new performance record
            performance = DailyPerformance(
                user_id=user_id,
                date=today,
                performance_score=performance_score,
                daily_target=target,
                actual_spent=spent,
                amount_saved=amount_saved,
                performance_category=performance_category,
                expenses_count=expenses_count,
                categories_used=categories or []
            )
            self.db.add(performance)
        
        # Determine if this contributes to streak (excellent or good performance)
        contributes_to_streak = performance_category in ['excellent', 'good']
        performance.contributed_to_streak = contributes_to_streak
        
        # Update streak
        streak_result = self._update_user_streak(user_id, performance_score, contributes_to_streak)
        
        # Update level/XP
        xp_gained = self._calculate_xp_from_performance(performance_score, contributes_to_streak)
        level_result = self._add_user_xp(user_id, xp_gained)
        
        # Check for achievements
        new_achievements = self._check_achievements(user_id, performance)
        
        self.db.commit()
        
        return {
            'performance': {
                'score': performance_score,
                'category': performance_category,
                'amount_saved': amount_saved,
                'contributes_to_streak': contributes_to_streak
            },
            'streak': streak_result,
            'level': level_result,
            'achievements': new_achievements,
            'xp_gained': xp_gained
        }
    
    def get_user_performance_summary(self, user_id: int, days: int = 30) -> Dict:
        """Get comprehensive performance summary for user"""
        
        # Get recent performances
        recent_performances = self.db.query(DailyPerformance).filter(
            DailyPerformance.user_id == user_id,
            DailyPerformance.date >= date.today() - timedelta(days=days)
        ).order_by(desc(DailyPerformance.date)).all()
        
        if not recent_performances:
            return self._empty_performance_summary()
        
        # Calculate summary statistics
        scores = [p.performance_score for p in recent_performances]
        week_scores = [p.performance_score for p in recent_performances[:7]]
        
        # Get streak data
        streak_data = self._get_user_streak_data(user_id)
        
        # Get level data
        level_data = self._get_user_level_data(user_id)
        
        # Performance analytics
        total_saved = sum(p.amount_saved for p in recent_performances)
        best_score = max(scores) if scores else 0
        avg_score = sum(scores) / len(scores) if scores else 0
        week_avg = sum(week_scores) / len(week_scores) if week_scores else 0
        
        # Trend analysis
        if len(scores) >= 7:
            recent_trend = sum(scores[:7]) / 7
            previous_trend = sum(scores[7:14]) / min(7, len(scores[7:14])) if len(scores) > 7 else recent_trend
            trend_direction = 'improving' if recent_trend > previous_trend else 'declining' if recent_trend < previous_trend else 'stable'
        else:
            trend_direction = 'insufficient_data'
        
        return {
            'current_performance': {
                'score': recent_performances[0].performance_score if recent_performances else 0,
                'category': recent_performances[0].performance_category if recent_performances else 'neutral',
                'spent_today': recent_performances[0].actual_spent if recent_performances else 0,
                'target_today': recent_performances[0].daily_target if recent_performances else 0,
                'saved_today': recent_performances[0].amount_saved if recent_performances else 0
            },
            'streak': streak_data,
            'level': level_data,
            'analytics': {
                'total_saved_period': total_saved,
                'average_score': round(avg_score, 1),
                'week_average': round(week_avg, 1),
                'personal_best': best_score,
                'trend_direction': trend_direction,
                'days_tracked': len(recent_performances)
            },
            'recent_performances': [
                {
                    'date': p.date.isoformat(),
                    'score': p.performance_score,
                    'category': p.performance_category,
                    'saved': p.amount_saved,
                    'streak_day': p.streak_day_number
                }
                for p in recent_performances[:14]  # Last 2 weeks
            ]
        }
    
    # ==================== STREAK MANAGEMENT ====================
    
    def _update_user_streak(self, user_id: int, performance_score: float, contributes: bool) -> Dict:
        """Update user's streak based on today's performance"""
        
        streak = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        if not streak:
            streak = UserStreak(user_id=user_id)
            self.db.add(streak)
        
        if contributes:
            # Extend streak
            streak_extended = streak.extend_streak(performance_score)
            
            # Update performance record with streak day
            today_performance = self.db.query(DailyPerformance).filter(
                DailyPerformance.user_id == user_id,
                DailyPerformance.date == date.today()
            ).first()
            if today_performance:
                today_performance.streak_day_number = streak.current_streak
        else:
            # Break streak if it was active
            if streak.is_active_today():
                streak.break_streak()
        
        return {
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
            'total_days': streak.total_training_days,
            'is_active': streak.is_active_today(),
            'last_active': streak.last_active_date.isoformat() if streak.last_active_date else None,
            'streak_start': streak.streak_start_date.isoformat() if streak.streak_start_date else None
        }
    
    def _get_user_streak_data(self, user_id: int) -> Dict:
        """Get current streak data for user"""
        streak = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        
        if not streak:
            return {
                'current_streak': 0,
                'longest_streak': 0,
                'total_days': 0,
                'is_active': False,
                'last_active': None,
                'streak_start': None
            }
        
        return {
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
            'total_days': streak.total_training_days,
            'is_active': streak.is_active_today(),
            'last_active': streak.last_active_date.isoformat() if streak.last_active_date else None,
            'streak_start': streak.streak_start_date.isoformat() if streak.streak_start_date else None
        }
    
    # ==================== ACHIEVEMENT SYSTEM ====================
    
    def _check_achievements(self, user_id: int, performance: DailyPerformance) -> List[Dict]:
        """Check and award new achievements"""
        new_achievements = []
        
        # Get user's existing achievements
        existing_achievement_ids = set(
            ua.achievement_id for ua in 
            self.db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
        )
        
        # Get all available achievements
        available_achievements = self.db.query(Achievement).filter(
            Achievement.is_active == True,
            ~Achievement.id.in_(existing_achievement_ids)
        ).all()
        
        # Check each achievement
        for achievement in available_achievements:
            if self._check_achievement_criteria(user_id, achievement, performance):
                # Award achievement
                user_achievement = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id,
                    progress_when_unlocked=self._get_progress_value(user_id, achievement)
                )
                self.db.add(user_achievement)
                
                # Add XP for achievement
                self._add_user_xp(user_id, achievement.points)
                
                new_achievements.append({
                    'id': achievement.id,
                    'title': achievement.title,
                    'description': achievement.description,
                    'icon': achievement.icon,
                    'tier': achievement.tier,
                    'points': achievement.points,
                    'unlocked_at': datetime.utcnow().isoformat()
                })
        
        return new_achievements
    
    def _check_achievement_criteria(self, user_id: int, achievement: Achievement, 
                                  current_performance: DailyPerformance) -> bool:
        """Check if user meets criteria for specific achievement"""
        
        if achievement.requirement_type == 'streak_days':
            streak = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
            return streak and streak.current_streak >= achievement.requirement_value
        
        elif achievement.requirement_type == 'total_saved':
            total_saved = self.db.query(func.sum(DailyPerformance.amount_saved)).filter(
                DailyPerformance.user_id == user_id,
                DailyPerformance.amount_saved > 0
            ).scalar() or 0
            return total_saved >= achievement.requirement_value
        
        elif achievement.requirement_type == 'performance_score':
            return current_performance.performance_score >= achievement.requirement_value
        
        elif achievement.requirement_type == 'consecutive_excellent':
            recent_performances = self.db.query(DailyPerformance).filter(
                DailyPerformance.user_id == user_id,
                DailyPerformance.performance_category == 'excellent'
            ).order_by(desc(DailyPerformance.date)).limit(int(achievement.requirement_value)).all()
            
            if len(recent_performances) < achievement.requirement_value:
                return False
            
            # Check if they're consecutive
            for i, perf in enumerate(recent_performances):
                expected_date = date.today() - timedelta(days=i)
                if perf.date != expected_date:
                    return False
            return True
        
        elif achievement.requirement_type == 'total_training_days':
            total_days = self.db.query(func.count(DailyPerformance.id)).filter(
                DailyPerformance.user_id == user_id
            ).scalar() or 0
            return total_days >= achievement.requirement_value
        
        return False
    
    def get_user_achievements(self, user_id: int) -> Dict:
        """Get all achievements for user - unlocked and available"""
        
        # Get unlocked achievements
        unlocked = self.db.query(UserAchievement, Achievement).join(Achievement).filter(
            UserAchievement.user_id == user_id
        ).order_by(desc(UserAchievement.unlocked_at)).all()
        
        # Get available achievements (not yet unlocked)
        unlocked_ids = [ua.achievement_id for ua, _ in unlocked]
        available = self.db.query(Achievement).filter(
            Achievement.is_active == True,
            ~Achievement.id.in_(unlocked_ids)
        ).order_by(Achievement.sort_order).all()
        
        # Calculate progress for available achievements
        available_with_progress = []
        for achievement in available:
            progress = self._calculate_achievement_progress(user_id, achievement)
            available_with_progress.append({
                'id': achievement.id,
                'title': achievement.title,
                'description': achievement.description,
                'icon': achievement.icon,
                'tier': achievement.tier,
                'category': achievement.category,
                'requirement': achievement.requirement_description,
                'progress': progress,
                'points': achievement.points,
                'unlocked': False
            })
        
        unlocked_list = []
        for user_achievement, achievement in unlocked:
            unlocked_list.append({
                'id': achievement.id,
                'title': achievement.title,
                'description': achievement.description,
                'icon': achievement.icon,
                'tier': achievement.tier,
                'category': achievement.category,
                'points': achievement.points,
                'unlocked': True,
                'unlocked_at': user_achievement.unlocked_at.isoformat()
            })
        
        return {
            'unlocked': unlocked_list,
            'available': available_with_progress,
            'total_unlocked': len(unlocked_list),
            'total_points': sum(a['points'] for a in unlocked_list)
        }
    
    def _calculate_achievement_progress(self, user_id: int, achievement: Achievement) -> float:
        """Calculate progress toward achievement (0-100)"""
        
        current_value = self._get_progress_value(user_id, achievement)
        progress = min(100, (current_value / achievement.requirement_value) * 100)
        return round(progress, 1)
    
    def _get_progress_value(self, user_id: int, achievement: Achievement) -> float:
        """Get current progress value for achievement type"""
        
        if achievement.requirement_type == 'streak_days':
            streak = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
            return streak.current_streak if streak else 0
        
        elif achievement.requirement_type == 'total_saved':
            return self.db.query(func.sum(DailyPerformance.amount_saved)).filter(
                DailyPerformance.user_id == user_id,
                DailyPerformance.amount_saved > 0
            ).scalar() or 0
        
        elif achievement.requirement_type == 'total_training_days':
            return self.db.query(func.count(DailyPerformance.id)).filter(
                DailyPerformance.user_id == user_id
            ).scalar() or 0
        
        # Add more progress types as needed
        return 0
    
    # ==================== LEVEL SYSTEM ====================
    
    def _add_user_xp(self, user_id: int, points: int) -> Dict:
        """Add XP to user and check for level up"""
        
        level_data = self.db.query(UserLevel).filter(UserLevel.user_id == user_id).first()
        if not level_data:
            level_data = UserLevel(user_id=user_id)
            self.db.add(level_data)
        
        leveled_up = level_data.add_xp(points)
        
        return {
            'current_level': level_data.current_level,
            'total_xp': level_data.total_xp,
            'current_level_xp': level_data.current_level_xp,
            'xp_to_next_level': level_data.xp_to_next_level,
            'leveled_up': leveled_up,
            'xp_gained': points
        }
    
    def _get_user_level_data(self, user_id: int) -> Dict:
        """Get user's current level data"""
        level_data = self.db.query(UserLevel).filter(UserLevel.user_id == user_id).first()
        
        if not level_data:
            return {
                'current_level': 1,
                'total_xp': 0,
                'current_level_xp': 0,
                'xp_to_next_level': 100,
                'achievements_unlocked': 0,
                'total_days_trained': 0,
                'total_saved': 0
            }
        
        return {
            'current_level': level_data.current_level,
            'total_xp': level_data.total_xp,
            'current_level_xp': level_data.current_level_xp,
            'xp_to_next_level': level_data.xp_to_next_level,
            'achievements_unlocked': level_data.achievements_unlocked,
            'total_days_trained': level_data.total_days_trained,
            'total_saved': level_data.total_saved
        }
    
    def _calculate_xp_from_performance(self, score: float, contributes_to_streak: bool) -> int:
        """Calculate XP based on performance"""
        base_xp = 10  # Base XP for logging performance
        
        # Performance bonus
        if score >= 90:
            base_xp += 50
        elif score >= 80:
            base_xp += 30
        elif score >= 70:
            base_xp += 20
        elif score >= 60:
            base_xp += 10
        
        # Streak bonus
        if contributes_to_streak:
            base_xp += 15
        
        return base_xp
    
    # ==================== HELPER METHODS ====================
    
    def _empty_performance_summary(self) -> Dict:
        """Return empty performance summary for new users"""
        return {
            'current_performance': {
                'score': 0,
                'category': 'neutral',
                'spent_today': 0,
                'target_today': 0,
                'saved_today': 0
            },
            'streak': {
                'current_streak': 0,
                'longest_streak': 0,
                'total_days': 0,
                'is_active': False,
                'last_active': None,
                'streak_start': None
            },
            'level': {
                'current_level': 1,
                'total_xp': 0,
                'current_level_xp': 0,
                'xp_to_next_level': 100,
                'achievements_unlocked': 0,
                'total_days_trained': 0,
                'total_saved': 0
            },
            'analytics': {
                'total_saved_period': 0,
                'average_score': 0,
                'week_average': 0,
                'personal_best': 0,
                'trend_direction': 'insufficient_data',
                'days_tracked': 0
            },
            'recent_performances': []
        }


def get_athletic_service(db: Session = None) -> AthleticService:
    """Get AthleticService instance with database session"""
    if db is None:
        db = next(get_db())
    return AthleticService(db)