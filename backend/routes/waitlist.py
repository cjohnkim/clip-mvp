from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import secrets
import string
import os
from models import db, User
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

waitlist_bp = Blueprint('waitlist', __name__)

def generate_signup_token():
    """Generate a secure random token for signup"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def validate_password(password):
    """Validate password meets requirements: 8+ chars, upper, lower, number, symbol"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one symbol (!@#$%^&*(),.?\":{}|<>)"
    
    return True, "Password meets all requirements"

def send_approval_email(email, token):
    """Send approval email with signup link"""
    try:
        # Email configuration
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_username or not smtp_password:
            print("Email credentials not configured")
            return False
        
        # Create signup URL
        frontend_url = os.environ.get('FRONTEND_URL', 'https://app.moneyclip.money')
        signup_url = f"{frontend_url}/signup?token={token}"
        
        # Email content
        subject = "🏆 Welcome to Money Clip - Your Financial Athletics Journey Begins!"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0a2540; margin-bottom: 10px;">🏆 You're In!</h1>
                    <p style="font-size: 18px; color: #059669; font-weight: 600;">Your Financial Athletics Journey Starts Now</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin-top: 0; color: white;">Ready to Transform Your Finances? 💪</h2>
                    <p style="margin-bottom: 25px; font-size: 16px;">You've been approved for Money Clip - the financial training platform that turns budgeting into an athletic performance game!</p>
                    
                    <a href="{signup_url}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        🚀 Complete Your Signup
                    </a>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #0a2540;">What Awaits You:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 12px;">🎯 <strong>Performance Scoring</strong> - Get 0-100 scores for daily financial performance</li>
                        <li style="margin-bottom: 12px;">🔥 <strong>Streak Tracking</strong> - Build momentum with daily wins</li>
                        <li style="margin-bottom: 12px;">🏆 <strong>25+ Achievements</strong> - Unlock badges as you hit milestones</li>
                        <li style="margin-bottom: 12px;">📈 <strong>Athletic Analytics</strong> - Track your progress like a pro athlete</li>
                        <li style="margin-bottom: 12px;">💪 <strong>Level System</strong> - Gain XP and level up your financial fitness</li>
                    </ul>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin-bottom: 25px;">
                    <p style="margin: 0; font-weight: 600; color: #0a2540;">⏰ Important: This signup link expires in 7 days</p>
                    <p style="margin: 10px 0 0 0; color: #666;">Complete your registration soon to start your financial training!</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #666; margin-bottom: 15px;">Questions? We're here to help you succeed!</p>
                    <p style="color: #059669; font-weight: 600;">Welcome to the future of financial fitness! 🎉</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_username
        msg['To'] = email
        
        # Add HTML part
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@waitlist_bp.route('/join', methods=['POST'])
def join_waitlist():
    """Add user to waitlist"""
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        source = data.get('source', 'app_signup')
        user_agent = request.headers.get('User-Agent', '')
        metadata = data.get('metadata', {})
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if email already exists
        session = db.session
        existing = session.execute(
            "SELECT id FROM waitlist WHERE email = :email",
            {'email': email}
        ).fetchone()
        
        if existing:
            return jsonify({'error': 'Email already on waitlist'}), 400
        
        # Insert into waitlist table
        session.execute("""
            INSERT INTO waitlist (email, name, source, user_agent, metadata, status, created_at)
            VALUES (:email, :name, :source, :user_agent, :metadata, 'pending', NOW())
        """, {
            'email': email,
            'name': name,
            'source': source,
            'user_agent': user_agent,
            'metadata': str(metadata) if metadata else None
        })
        session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Added to waitlist! We\'ll notify you when a spot opens up.'
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@waitlist_bp.route('/approve', methods=['POST'])
@jwt_required()
def approve_waitlist_user():
    """Approve a user from waitlist and send signup token"""
    try:
        data = request.get_json()
        email = data.get('email')
        approved_by = get_jwt_identity()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        session = db.session
        
        # Check if user exists in waitlist
        waitlist_user = session.execute(
            "SELECT id, name, status FROM waitlist WHERE email = :email",
            {'email': email}
        ).fetchone()
        
        if not waitlist_user:
            return jsonify({'error': 'Email not found in waitlist'}), 404
        
        if waitlist_user.status == 'approved':
            return jsonify({'error': 'User already approved'}), 400
        
        # Generate token
        token = generate_signup_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        # Store token in signup_tokens table
        session.execute("""
            INSERT INTO signup_tokens (email, token, expires_at, created_at)
            VALUES (:email, :token, :expires_at, NOW())
        """, {
            'email': email,
            'token': token,
            'expires_at': expires_at
        })
        
        # Update waitlist status to 'approved'
        session.execute("""
            UPDATE waitlist 
            SET status = 'approved', approved_at = NOW(), approved_by = :approved_by
            WHERE email = :email
        """, {
            'email': email,
            'approved_by': approved_by
        })
        
        session.commit()
        
        # Send approval email
        if send_approval_email(email, token):
            return jsonify({
                'success': True,
                'message': f'Approval email sent to {email}',
                'token': token,
                'expires_at': expires_at.isoformat()
            })
        else:
            return jsonify({'error': 'Failed to send approval email'}), 500
            
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@waitlist_bp.route('/validate-token/<token>', methods=['GET'])
def validate_token(token):
    """Validate signup token"""
    try:
        session = db.session
        
        # Check if token exists and is valid
        token_data = session.execute("""
            SELECT st.email, st.expires_at, st.used_at, w.name
            FROM signup_tokens st
            JOIN waitlist w ON st.email = w.email
            WHERE st.token = :token
        """, {'token': token}).fetchone()
        
        if not token_data:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 404
        
        if token_data.used_at:
            return jsonify({'valid': False, 'error': 'Token already used'}), 400
        
        if token_data.expires_at < datetime.utcnow():
            return jsonify({'valid': False, 'error': 'Token expired'}), 400
        
        return jsonify({
            'valid': True,
            'email': token_data.email,
            'name': token_data.name,
            'expires_at': token_data.expires_at.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@waitlist_bp.route('/signup-with-token', methods=['POST'])
def signup_with_token():
    """Complete signup using valid token"""
    try:
        data = request.get_json()
        token = data.get('token')
        password = data.get('password')
        
        if not token or not password:
            return jsonify({'error': 'Token and password are required'}), 400
        
        # Validate password
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        session = db.session
        
        # Validate token
        token_data = session.execute("""
            SELECT st.email, st.expires_at, st.used_at, w.name
            FROM signup_tokens st
            JOIN waitlist w ON st.email = w.email
            WHERE st.token = :token
        """, {'token': token}).fetchone()
        
        if not token_data:
            return jsonify({'error': 'Invalid token'}), 404
        
        if token_data.used_at:
            return jsonify({'error': 'Token already used'}), 400
        
        if token_data.expires_at < datetime.utcnow():
            return jsonify({'error': 'Token expired'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=token_data.email).first()
        if existing_user:
            return jsonify({'error': 'Account already exists'}), 400
        
        # Create user account
        user = User(
            email=token_data.email,
            first_name=token_data.name or token_data.email.split('@')[0]
        )
        user.set_password(password)
        
        session.add(user)
        
        # Mark token as used
        session.execute("""
            UPDATE signup_tokens 
            SET used_at = NOW() 
            WHERE token = :token
        """, {'token': token})
        
        # Update waitlist status
        session.execute("""
            UPDATE waitlist 
            SET status = 'signed_up' 
            WHERE email = :email
        """, {'email': token_data.email})
        
        session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully! Welcome to Money Clip!',
            'user': {
                'email': user.email,
                'first_name': user.first_name
            }
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@waitlist_bp.route('/validate-password', methods=['POST'])
def validate_password_endpoint():
    """Validate password strength"""
    try:
        data = request.get_json()
        password = data.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        is_valid, message = validate_password(password)
        
        return jsonify({
            'valid': is_valid,
            'message': message,
            'requirements': {
                'length': len(password) >= 8,
                'uppercase': bool(re.search(r'[A-Z]', password)),
                'lowercase': bool(re.search(r'[a-z]', password)),
                'number': bool(re.search(r'\d', password)),
                'symbol': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500