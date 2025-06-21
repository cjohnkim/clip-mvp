from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import secrets
import string
import os
from models import db, User, Waitlist, SignupToken
from sqlalchemy import text
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

def send_waitlist_confirmation_email(email, name):
    """Send confirmation email when user joins waitlist"""
    try:
        # Email configuration
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_username or not smtp_password:
            print("Email credentials not configured")
            return False
        
        # Email content
        subject = "🏆 You're on the Money Clip waitlist!"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #000; background: #fff;">
            <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #000;">Hey {name}! 👋</h1>
                
                <p>Thanks for joining the Money Clip waitlist!</p>
                
                <p>You're now signed up for early access to our financial athletics platform. We'll email you when your spot is ready.</p>
                
                <p><strong>What's Money Clip?</strong><br>
                It's a platform that turns budgeting into an athletic performance game. Think daily scores, streaks, and achievements for your money habits.</p>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>We'll email you when approved</li>
                    <li>You'll get early access before launch</li>
                    <li>Start training your financial fitness</li>
                </ul>
                
                <p>Thanks again!</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">
                    Questions? Just reply to this email.<br>
                    You're getting this because you signed up for Money Clip.
                </p>
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
        print(f"Failed to send waitlist confirmation email: {e}")
        import traceback
        traceback.print_exc()
        return False

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
        signup_url = f"{frontend_url}/auth.html?token={token}"
        
        # Email content
        subject = "🏆 Welcome to Money Clip - Your Financial Athletics Journey Begins!"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #000; background: #fff;">
            <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #000;">You're approved! 🎉</h1>
                
                <p>Your Money Clip account is ready. Click the link below to create your password and start using the app.</p>
                
                <p style="margin: 30px 0;">
                    <a href="{signup_url}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Complete Signup →
                    </a>
                </p>
                
                <p><strong>What you'll get:</strong></p>
                <ul>
                    <li>Daily performance scores (0-100)</li>
                    <li>Streak tracking for good habits</li>
                    <li>Achievement badges</li>
                    <li>Progress analytics</li>
                    <li>Level-up system</li>
                </ul>
                
                <p><strong>Important:</strong> This signup link expires in 7 days.</p>
                
                <p>Ready to start training? 💪</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">
                    Questions? Just reply to this email.<br>
                    Link not working? Copy and paste: {signup_url}
                </p>
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
        
        # Check if exact email already exists
        existing = Waitlist.query.filter_by(email=email).first()
        
        if existing:
            return jsonify({'error': 'Email already on waitlist'}), 400
        
        # Create new waitlist entry
        waitlist_user = Waitlist(
            email=email,
            name=name,
            source=source,
            user_agent=user_agent,
            user_metadata=str(metadata) if metadata else None,
            status='pending'
        )
        
        db.session.add(waitlist_user)
        db.session.commit()
        
        # Send welcome email
        print(f"Attempting to send welcome email to {email} with name '{name or 'there'}'")
        email_sent = send_waitlist_confirmation_email(email, name or 'there')
        print(f"Email send result: {email_sent}")
        
        return jsonify({
            'success': True,
            'message': 'Added to waitlist! Check your email for confirmation.',
            'email_sent': email_sent
        })
        
    except Exception as e:
        db.session.rollback()
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
        waitlist_user.approved_by = approved_by
        
        db.session.commit()
        
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
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@waitlist_bp.route('/validate-token/<token>', methods=['GET'])
def validate_token(token):
    """Validate signup token"""
    try:
        # Check if token exists and is valid using SQLAlchemy ORM
        signup_token = SignupToken.query.filter_by(token=token).first()
        
        if not signup_token:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 404
        
        if signup_token.used_at:
            return jsonify({'valid': False, 'error': 'Token already used'}), 400
        
        # Handle both string and datetime types for expires_at
        expires_at = signup_token.expires_at
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        
        if expires_at < datetime.utcnow():
            return jsonify({'valid': False, 'error': 'Token expired'}), 400
        
        # Get associated waitlist user
        waitlist_user = Waitlist.query.filter_by(email=signup_token.email).first()
        
        return jsonify({
            'valid': True,
            'email': signup_token.email,
            'name': waitlist_user.name if waitlist_user else signup_token.email.split('@')[0],
            'expires_at': signup_token.expires_at.isoformat()
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
        
        # Validate token using SQLAlchemy ORM
        signup_token = SignupToken.query.filter_by(token=token).first()
        
        if not signup_token:
            return jsonify({'error': 'Invalid token'}), 404
        
        if signup_token.used_at:
            return jsonify({'error': 'Token already used'}), 400
        
        # Handle both string and datetime types for expires_at
        expires_at = signup_token.expires_at
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        
        if expires_at < datetime.utcnow():
            return jsonify({'error': 'Token expired'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=signup_token.email).first()
        if existing_user:
            return jsonify({'error': 'Account already exists'}), 400
        
        # Get waitlist user for name
        waitlist_user = Waitlist.query.filter_by(email=signup_token.email).first()
        
        # Create user account
        user = User(
            email=signup_token.email,
            first_name=waitlist_user.name if waitlist_user else signup_token.email.split('@')[0]
        )
        user.set_password(password)
        
        db.session.add(user)
        
        # Mark token as used
        signup_token.used_at = datetime.utcnow()
        
        # Update waitlist status
        if waitlist_user:
            waitlist_user.status = 'signed_up'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully! Welcome to Money Clip!',
            'user': {
                'email': user.email,
                'first_name': user.first_name
            }
        })
        
    except Exception as e:
        db.session.rollback()
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