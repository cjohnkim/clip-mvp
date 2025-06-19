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

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Ensure all models are created
with app.app_context():
    db.create_all()

# Import routes
from routes.auth import auth_bp
from routes.planning import planning_bp
from routes.calculation import calculation_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(planning_bp, url_prefix='/api/planning')
app.register_blueprint(calculation_bp, url_prefix='/api/calculation')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'Money Clip MVP API',
        'version': '1.0.0',
        'description': 'Forward-looking personal finance API',
        'endpoints': {
            'auth': '/api/auth (login, signup, logout)',
            'planning': '/api/planning (expenses, income)',
            'calculation': '/api/calculation (daily-clip, scenarios)'
        }
    })

# Create database tables (handled in run.py or deployment)

if __name__ == '__main__':
    # Development server
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)