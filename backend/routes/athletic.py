from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.athletic_service import get_athletic_service
from models import db

athletic_bp = Blueprint('athletic', __name__, url_prefix='/api/athletic')

@athletic_bp.route('/performance/record', methods=['POST'])
@jwt_required()
def record_performance():
    """Record today's performance data"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['daily_target', 'actual_spent']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        target = float(data['daily_target'])
        spent = float(data['actual_spent'])
        expenses_count = data.get('expenses_count', 0)
        categories = data.get('categories', [])
        
        # Validate values
        if target < 0 or spent < 0:
            return jsonify({'error': 'Target and spent amounts must be non-negative'}), 400
        
        # Record performance
        session = db.session
        athletic_service = get_athletic_service(session)
        result = athletic_service.record_daily_performance(
            user_id, target, spent, expenses_count, categories
        )
        
        return jsonify({
            'success': True,
            'message': 'Performance recorded successfully',
            'data': result
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid numeric values provided'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to record performance: {str(e)}'}), 500

@athletic_bp.route('/performance/summary', methods=['GET'])
@jwt_required()
def get_performance_summary():
    """Get comprehensive performance summary"""
    try:
        user_id = get_jwt_identity()
        days = request.args.get('days', 30, type=int)
        
        # Validate days parameter
        if days < 1 or days > 365:
            return jsonify({'error': 'Days parameter must be between 1 and 365'}), 400
        
        session = db.session
        athletic_service = get_athletic_service(session)
        summary = athletic_service.get_user_performance_summary(user_id, days)
        
        return jsonify({
            'success': True,
            'data': summary
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get performance summary: {str(e)}'}), 500

@athletic_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak_data():
    """Get user's current streak information"""
    try:
        user_id = get_jwt_identity()
        
        session = db.session
        athletic_service = get_athletic_service(session)
        streak_data = athletic_service._get_user_streak_data(user_id)
        
        return jsonify({
            'success': True,
            'data': streak_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get streak data: {str(e)}'}), 500

@athletic_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    """Get user's achievements - both unlocked and available"""
    try:
        user_id = get_jwt_identity()
        
        session = db.session
        athletic_service = get_athletic_service(session)
        achievements = athletic_service.get_user_achievements(user_id)
        
        return jsonify({
            'success': True,
            'data': achievements
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get achievements: {str(e)}'}), 500

@athletic_bp.route('/achievements/<int:achievement_id>/share', methods=['POST'])
@jwt_required()
def share_achievement():
    """Mark achievement as shared for social features"""
    try:
        user_id = get_jwt_identity()
        achievement_id = request.view_args['achievement_id']
        
        session = db.session
        
        # Find user's achievement
        from models import UserAchievement
        user_achievement = session.query(UserAchievement).filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement_id
        ).first()
        
        if not user_achievement:
            return jsonify({'error': 'Achievement not found or not unlocked'}), 404
        
        # Mark as shared
        user_achievement.is_shared = True
        user_achievement.shared_at = datetime.utcnow()
        session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Achievement marked as shared'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to share achievement: {str(e)}'}), 500

@athletic_bp.route('/level', methods=['GET'])
@jwt_required()
def get_level_data():
    """Get user's current level and XP information"""
    try:
        user_id = get_jwt_identity()
        
        session = db.session
        athletic_service = get_athletic_service(session)
        level_data = athletic_service._get_user_level_data(user_id)
        
        return jsonify({
            'success': True,
            'data': level_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get level data: {str(e)}'}), 500

@athletic_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_athletic_dashboard():
    """Get complete athletic dashboard data"""
    try:
        user_id = get_jwt_identity()
        
        session = db.session
        athletic_service = get_athletic_service(session)
        
        # Get all athletic data
        performance_summary = athletic_service.get_user_performance_summary(user_id, 30)
        achievements = athletic_service.get_user_achievements(user_id)
        
        # Combine into dashboard
        dashboard = {
            'performance': performance_summary['current_performance'],
            'streak': performance_summary['streak'],
            'level': performance_summary['level'],
            'analytics': performance_summary['analytics'],
            'recent_performances': performance_summary['recent_performances'][:7],  # Last week
            'achievements': {
                'recent_unlocked': achievements['unlocked'][:3],  # Last 3 unlocked
                'progress_achievements': [
                    a for a in achievements['available'] 
                    if a['progress'] > 0
                ][:3],  # Top 3 in progress
                'total_unlocked': achievements['total_unlocked'],
                'total_points': achievements['total_points']
            }
        }
        
        return jsonify({
            'success': True,
            'data': dashboard
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get athletic dashboard: {str(e)}'}), 500

@athletic_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Get anonymous leaderboard data"""
    try:
        user_id = get_jwt_identity()
        leaderboard_type = request.args.get('type', 'week')  # week, month, all_time
        
        session = db.session
        
        # Get leaderboard data (anonymous)
        from sqlalchemy import func, desc
        from models import DailyPerformance, UserStreak
        from datetime import timedelta
        
        if leaderboard_type == 'week':
            week_ago = date.today() - timedelta(days=7)
            leaderboard_query = session.query(
                func.avg(DailyPerformance.performance_score).label('avg_score'),
                func.count(DailyPerformance.id).label('days_count')
            ).filter(
                DailyPerformance.date >= week_ago
            ).group_by(DailyPerformance.user_id).order_by(desc('avg_score')).limit(10)
            
        elif leaderboard_type == 'month':
            month_ago = date.today() - timedelta(days=30)
            leaderboard_query = session.query(
                func.avg(DailyPerformance.performance_score).label('avg_score'),
                func.count(DailyPerformance.id).label('days_count')
            ).filter(
                DailyPerformance.date >= month_ago
            ).group_by(DailyPerformance.user_id).order_by(desc('avg_score')).limit(10)
            
        else:  # all_time
            leaderboard_query = session.query(
                UserStreak.current_streak.label('streak'),
                UserStreak.longest_streak.label('longest_streak'),
                UserStreak.total_training_days.label('total_days')
            ).order_by(desc(UserStreak.longest_streak)).limit(10)
        
        results = leaderboard_query.all()
        
        # Format anonymous results
        leaderboard = []
        for i, result in enumerate(results, 1):
            if leaderboard_type == 'all_time':
                leaderboard.append({
                    'rank': i,
                    'current_streak': result.streak,
                    'longest_streak': result.longest_streak,
                    'total_days': result.total_days,
                    'anonymous_id': f'Athlete{i:02d}'
                })
            else:
                leaderboard.append({
                    'rank': i,
                    'average_score': round(result.avg_score, 1),
                    'days_active': result.days_count,
                    'anonymous_id': f'Athlete{i:02d}'
                })
        
        return jsonify({
            'success': True,
            'data': {
                'type': leaderboard_type,
                'leaderboard': leaderboard,
                'user_rank': None  # TODO: Calculate user's rank
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get leaderboard: {str(e)}'}), 500

@athletic_bp.route('/performance/simulate', methods=['POST'])
@jwt_required()
def simulate_performance():
    """Simulate performance for testing - development only"""
    try:
        # Only allow in development
        import os
        if os.environ.get('FLASK_ENV') != 'development':
            return jsonify({'error': 'Only available in development mode'}), 403
        
        user_id = get_jwt_identity()
        data = request.get_json()
        
        days_to_simulate = data.get('days', 7)
        base_target = data.get('base_target', 50.0)
        performance_variation = data.get('performance_variation', 0.3)  # 30% variation
        
        session = db.session
        athletic_service = get_athletic_service(session)
        
        import random
        results = []
        
        for i in range(days_to_simulate):
            # Simulate spending with some randomness
            variation = random.uniform(-performance_variation, performance_variation)
            spent = base_target * (1 + variation)
            spent = max(0, spent)  # Ensure non-negative
            
            # Occasionally simulate excellent performance
            if random.random() < 0.3:  # 30% chance of excellent performance
                spent = base_target * random.uniform(0.3, 0.7)  # Save 30-70%
            
            result = athletic_service.record_daily_performance(
                user_id, base_target, spent, 
                random.randint(1, 8), ['food', 'transport', 'entertainment']
            )
            results.append(result)
        
        return jsonify({
            'success': True,
            'message': f'Simulated {days_to_simulate} days of performance',
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to simulate performance: {str(e)}'}), 500

# Error handlers
@athletic_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Athletic endpoint not found'}), 404

@athletic_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error in athletic system'}), 500