"""
Money Clip MVP - Flask Application

Simple Flask backend for manual financial planning and daily clip calculation.
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///money_clip.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-secret')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# Import models first
from models import db, User, Account, PlannedExpense, PlannedIncome, PaycheckSchedule
from models import UserStreak, Achievement, UserAchievement, DailyPerformance, UserLevel
from models import Waitlist, SignupToken

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Database initialization with retry logic
def init_database():
    """Initialize database with retry logic"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with app.app_context():
                db.create_all()
                print(f"✅ Database connected and all tables created on attempt {attempt + 1}")
                return True
        except Exception as e:
            print(f"❌ Database connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                import time
                time.sleep(2)  # Wait 2 seconds before retry
            else:
                print("⚠️  Database connection failed, but app will continue")
                return False

# Try to initialize database (don't fail if it doesn't work)
init_database()

# Import routes
from routes.auth import auth_bp
from routes.planning import planning_bp
from routes.calculation import calculation_bp
from routes.athletic import athletic_bp
from routes.waitlist import waitlist_bp
from routes.admin import admin_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(planning_bp, url_prefix='/api/planning')
app.register_blueprint(calculation_bp, url_prefix='/api/calculation')
app.register_blueprint(athletic_bp, url_prefix='/api/athletic')
app.register_blueprint(waitlist_bp, url_prefix='/api/waitlist')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if db else 'disconnected'
    })

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'Money Clip MVP API',
        'version': '2.0.0',
        'description': 'Financial Athletics Platform API',
        'endpoints': {
            'auth': '/api/auth (login, signup, logout)',
            'planning': '/api/planning (expenses, income)',
            'calculation': '/api/calculation (daily-clip, scenarios)',
            'athletic': '/api/athletic (performance, achievements, streaks)',
            'waitlist': '/api/waitlist (join, approve, signup with token)',
            'admin': '/api/admin (waitlist management - JWT protected)'
        }
    })

# Create database tables (handled in run.py or deployment)

if __name__ == '__main__':
    # Development server
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)