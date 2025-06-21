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

@app.route('/api/test-env', methods=['GET'])
def test_env():
    """Test endpoint to check SMTP environment variables"""
    
    smtp_vars = {
        'SMTP_SERVER': os.environ.get('SMTP_SERVER'),
        'SMTP_PORT': os.environ.get('SMTP_PORT'),
        'SMTP_USERNAME': os.environ.get('SMTP_USERNAME'),
        'SMTP_PASSWORD': '***' if os.environ.get('SMTP_PASSWORD') else None,
        'ADMIN_EMAIL': os.environ.get('ADMIN_EMAIL'),
        'FRONTEND_URL': os.environ.get('FRONTEND_URL')
    }
    
    return jsonify({
        'smtp_vars': smtp_vars,
        'missing_vars': [k for k, v in smtp_vars.items() if v is None and k != 'SMTP_PASSWORD']
    })

@app.route('/api/test-approve', methods=['POST'])
def test_approve():
    """Test approval flow without JWT for debugging"""
    from routes.admin import send_approval_email, generate_signup_token
    from models import Waitlist, SignupToken
    
    try:
        data = request.get_json()
        email = data.get('email', 'cjohnkim+railway@gmail.com')
        
        # Check if user exists in waitlist
        waitlist_user = Waitlist.query.filter_by(email=email).first()
        
        if not waitlist_user:
            return jsonify({'error': 'Email not found in waitlist'}), 404
        
        if waitlist_user.status == 'approved':
            return jsonify({'error': 'User already approved'}), 400
        
        # Generate token
        token = generate_signup_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        # Create signup token
        signup_token = SignupToken(
            email=email,
            token=token,
            expires_at=expires_at
        )
        db.session.add(signup_token)
        
        # Update waitlist status to 'approved'
        waitlist_user.status = 'approved'
        waitlist_user.approved_at = datetime.utcnow()
        waitlist_user.approved_by = 'test-admin'
        
        db.session.commit()
        
        # Send approval email
        email_sent = send_approval_email(email, token)
        
        return jsonify({
            'success': True,
            'message': f'Test approval completed for {email}',
            'token': token,
            'signup_url': f"https://app.moneyclip.money/signup.html?token={token}",
            'expires_at': expires_at.isoformat(),
            'email_sent': email_sent
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Approval failed: {str(e)}'}), 500

@app.route('/api/test-email', methods=['POST'])
def test_email():
    """Test email sending directly from production"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    try:
        recipient = request.json.get('email', 'cjohnkim+railway@gmail.com')
        
        # Email configuration from environment
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_username or not smtp_password:
            return jsonify({'error': 'SMTP credentials not configured'}), 500
        
        # Create test message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "🧪 Production SMTP Test - Money Clip"
        msg['From'] = smtp_username
        msg['To'] = recipient
        
        html_body = """
        <html>
        <body>
            <h2>🧪 Production SMTP Test Successful!</h2>
            <p>This email was sent from the Railway production server.</p>
            <p>The email system is working correctly!</p>
            <hr>
            <small>Money Clip Production Test</small>
        </body>
        </html>
        """
        
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        return jsonify({
            'success': True,
            'message': f'Test email sent to {recipient}',
            'smtp_server': smtp_server,
            'smtp_port': smtp_port
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Failed to send email: {str(e)}',
            'smtp_configured': bool(os.environ.get('SMTP_USERNAME') and os.environ.get('SMTP_PASSWORD'))
        }), 500

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