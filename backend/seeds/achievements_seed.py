"""
Seed data for achievements system
Creates a comprehensive set of achievements for financial athletes
"""

from ..models.athletic import Achievement
from ..database import get_db

ACHIEVEMENTS_DATA = [
    # ==================== STREAK ACHIEVEMENTS ====================
    {
        'title': 'First Steps',
        'description': 'Complete your first day of financial training',
        'icon': '🚀',
        'category': 'streak',
        'tier': 'bronze',
        'requirement_type': 'streak_days',
        'requirement_value': 1,
        'requirement_description': 'Maintain streak for 1 day',
        'points': 50,
        'sort_order': 1
    },
    {
        'title': 'Building Momentum',
        'description': 'Stay under your target for 3 consecutive days',
        'icon': '💪',
        'category': 'streak',
        'tier': 'bronze',
        'requirement_type': 'streak_days',
        'requirement_value': 3,
        'requirement_description': 'Maintain streak for 3 days',
        'points': 100,
        'sort_order': 2
    },
    {
        'title': 'Week Warrior',
        'description': 'Complete a full week of financial discipline',
        'icon': '🔥',
        'category': 'streak',
        'tier': 'silver',
        'requirement_type': 'streak_days',
        'requirement_value': 7,
        'requirement_description': 'Maintain streak for 7 days',
        'points': 250,
        'sort_order': 3
    },
    {
        'title': 'Fortnight Fighter',
        'description': 'Two weeks of consistent financial performance',
        'icon': '⚡',
        'category': 'streak',
        'tier': 'silver',
        'requirement_type': 'streak_days',
        'requirement_value': 14,
        'requirement_description': 'Maintain streak for 14 days',
        'points': 400,
        'sort_order': 4
    },
    {
        'title': 'Monthly Master',
        'description': 'Achieve a 30-day streak of financial excellence',
        'icon': '👑',
        'category': 'streak',
        'tier': 'gold',
        'requirement_type': 'streak_days',
        'requirement_value': 30,
        'requirement_description': 'Maintain streak for 30 days',
        'points': 750,
        'sort_order': 5
    },
    {
        'title': 'Century Champion',
        'description': 'Legendary 100-day streak of financial discipline',
        'icon': '🏆',
        'category': 'streak',
        'tier': 'platinum',
        'requirement_type': 'streak_days',
        'requirement_value': 100,
        'requirement_description': 'Maintain streak for 100 days',
        'points': 2000,
        'sort_order': 6
    },
    
    # ==================== SAVINGS ACHIEVEMENTS ====================
    {
        'title': 'First $100',
        'description': 'Save your first $100 through daily discipline',
        'icon': '💵',
        'category': 'savings',
        'tier': 'bronze',
        'requirement_type': 'total_saved',
        'requirement_value': 100,
        'requirement_description': 'Save $100 total',
        'points': 150,
        'sort_order': 10
    },
    {
        'title': 'Emergency Buffer',
        'description': 'Build a $500 safety net',
        'icon': '🛡️',
        'category': 'savings',
        'tier': 'silver',
        'requirement_type': 'total_saved',
        'requirement_value': 500,
        'requirement_description': 'Save $500 total',
        'points': 300,
        'sort_order': 11
    },
    {
        'title': 'Thousand Club',
        'description': 'Join the elite $1,000 savers club',
        'icon': '💎',
        'category': 'savings',
        'tier': 'silver',
        'requirement_type': 'total_saved',
        'requirement_value': 1000,
        'requirement_description': 'Save $1,000 total',
        'points': 500,
        'sort_order': 12
    },
    {
        'title': 'Emergency Fund Hero',
        'description': 'Build a complete $5,000 emergency fund',
        'icon': '🦸',
        'category': 'savings',
        'tier': 'gold',
        'requirement_type': 'total_saved',
        'requirement_value': 5000,
        'requirement_description': 'Save $5,000 total',
        'points': 1000,
        'sort_order': 13
    },
    {
        'title': 'Financial Freedom Fighter',
        'description': 'Accumulate $10,000 in savings',
        'icon': '🗽',
        'category': 'savings',
        'tier': 'platinum',
        'requirement_type': 'total_saved',
        'requirement_value': 10000,
        'requirement_description': 'Save $10,000 total',
        'points': 2500,
        'sort_order': 14
    },
    
    # ==================== PERFORMANCE ACHIEVEMENTS ====================
    {
        'title': 'Perfect Score',
        'description': 'Achieve a perfect 100 performance score',
        'icon': '⭐',
        'category': 'performance',
        'tier': 'silver',
        'requirement_type': 'performance_score',
        'requirement_value': 100,
        'requirement_description': 'Score 100 points in a day',
        'points': 200,
        'sort_order': 20
    },
    {
        'title': 'Excellence Streak',
        'description': 'Score excellent performance 7 days in a row',
        'icon': '🌟',
        'category': 'performance',
        'tier': 'gold',
        'requirement_type': 'consecutive_excellent',
        'requirement_value': 7,
        'requirement_description': 'Excellent performance for 7 consecutive days',
        'points': 600,
        'sort_order': 21
    },
    {
        'title': 'Consistency King',
        'description': 'Maintain good or excellent performance for 2 weeks',
        'icon': '👑',
        'category': 'performance',
        'tier': 'gold',
        'requirement_type': 'consecutive_good_or_excellent',
        'requirement_value': 14,
        'requirement_description': 'Good or excellent performance for 14 consecutive days',
        'points': 800,
        'sort_order': 22
    },
    
    # ==================== MILESTONE ACHIEVEMENTS ====================
    {
        'title': 'Training Rookie',
        'description': 'Complete 7 total days of financial training',
        'icon': '🥉',
        'category': 'milestone',
        'tier': 'bronze',
        'requirement_type': 'total_training_days',
        'requirement_value': 7,
        'requirement_description': 'Log performance for 7 total days',
        'points': 100,
        'sort_order': 30
    },
    {
        'title': 'Dedicated Athlete',
        'description': 'Complete 30 total days of financial training',
        'icon': '🥈',
        'category': 'milestone',
        'tier': 'silver',
        'requirement_type': 'total_training_days',
        'requirement_value': 30,
        'requirement_description': 'Log performance for 30 total days',
        'points': 300,
        'sort_order': 31
    },
    {
        'title': 'Financial Veteran',
        'description': 'Complete 100 total days of financial training',
        'icon': '🥇',
        'category': 'milestone',
        'tier': 'gold',
        'requirement_type': 'total_training_days',
        'requirement_value': 100,
        'requirement_description': 'Log performance for 100 total days',
        'points': 750,
        'sort_order': 32
    },
    {
        'title': 'Legendary Trainer',
        'description': 'Complete 365 total days of financial training',
        'icon': '🏅',
        'category': 'milestone',
        'tier': 'platinum',
        'requirement_type': 'total_training_days',
        'requirement_value': 365,
        'requirement_description': 'Log performance for 365 total days',
        'points': 2000,
        'sort_order': 33
    },
    
    # ==================== CHALLENGE ACHIEVEMENTS ====================
    {
        'title': 'Zero Spend Day',
        'description': 'Complete a day without spending anything',
        'icon': '🎯',
        'category': 'challenge',
        'tier': 'silver',
        'requirement_type': 'zero_spend_day',
        'requirement_value': 1,
        'requirement_description': 'Spend $0 in a single day',
        'points': 300,
        'sort_order': 40
    },
    {
        'title': 'Big Saver',
        'description': 'Save 80% of your daily target in one day',
        'icon': '💰',
        'category': 'challenge',
        'tier': 'gold',
        'requirement_type': 'high_save_percentage',
        'requirement_value': 80,
        'requirement_description': 'Save 80% or more of daily target',
        'points': 400,
        'sort_order': 41
    },
    {
        'title': 'Comeback Champion',
        'description': 'Restart your streak after breaking a 7+ day streak',
        'icon': '🔄',
        'category': 'challenge',
        'tier': 'silver',
        'requirement_type': 'streak_comeback',
        'requirement_value': 7,
        'requirement_description': 'Restart streak after breaking 7+ day streak',
        'points': 250,
        'sort_order': 42
    },
    
    # ==================== SEASONAL/SPECIAL ACHIEVEMENTS ====================
    {
        'title': 'New Year New Me',
        'description': 'Start your financial training journey in January',
        'icon': '🎊',
        'category': 'special',
        'tier': 'bronze',
        'requirement_type': 'january_starter',
        'requirement_value': 1,
        'requirement_description': 'Begin training in January',
        'points': 100,
        'sort_order': 50
    },
    {
        'title': 'Holiday Discipline',
        'description': 'Maintain your streak through December',
        'icon': '🎄',
        'category': 'special',
        'tier': 'gold',
        'requirement_type': 'december_streak',
        'requirement_value': 7,
        'requirement_description': 'Maintain 7+ day streak in December',
        'points': 500,
        'sort_order': 51
    },
    {
        'title': 'Early Bird',
        'description': 'Join Clip in the first month of launch',
        'icon': '🐦',
        'category': 'special',
        'tier': 'platinum',
        'requirement_type': 'early_adopter',
        'requirement_value': 1,
        'requirement_description': 'Join during beta or first month',
        'points': 1000,
        'sort_order': 52
    }
]

def seed_achievements():
    """Seed the database with default achievements"""
    db = next(get_db())
    
    try:
        # Check if achievements already exist
        existing_count = db.query(Achievement).count()
        if existing_count > 0:
            print(f"Achievements already seeded ({existing_count} exist). Skipping...")
            return
        
        # Create achievements
        for achievement_data in ACHIEVEMENTS_DATA:
            achievement = Achievement(**achievement_data)
            db.add(achievement)
        
        db.commit()
        print(f"Successfully seeded {len(ACHIEVEMENTS_DATA)} achievements!")
        
        # Print summary
        categories = {}
        tiers = {}
        for achievement in ACHIEVEMENTS_DATA:
            categories[achievement['category']] = categories.get(achievement['category'], 0) + 1
            tiers[achievement['tier']] = tiers.get(achievement['tier'], 0) + 1
        
        print("\nAchievements by category:")
        for category, count in categories.items():
            print(f"  {category}: {count}")
        
        print("\nAchievements by tier:")
        for tier, count in tiers.items():
            print(f"  {tier}: {count}")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding achievements: {e}")
        raise

if __name__ == "__main__":
    seed_achievements()