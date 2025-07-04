"""
Money Clip MVP - Admin Routes

Admin API endpoints for waitlist management.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import secrets
import string
import os
from models_simple import db, User, Waitlist, SignupToken
from sqlalchemy import text
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

admin_bp = Blueprint('admin', __name__)

def generate_signup_token():
    """Generate a secure random token for signup"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

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
        
        # Create signup URL - point to backend-served page
        signup_url = f"https://clip-mvp-production.up.railway.app/signup/{token}"
        
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
        msg['From'] = f"Money Clip <{smtp_username}>"
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

@admin_bp.route('/waitlist/list', methods=['GET'])
@jwt_required()
def list_waitlist_users():
    """List all waitlist users"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
        session = db.session
        users = session.execute(text("""
            SELECT id, email, name, status, created_at, approved_at, approved_by, source, user_agent
            FROM waitlist 
            ORDER BY created_at DESC
        """)).fetchall()
        
        user_list = []
        for user in users:
            user_dict = {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'status': user.status,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'approved_at': user.approved_at.isoformat() if user.approved_at else None,
                'approved_by': user.approved_by,
                'source': user.source,
                'user_agent': user.user_agent
            }
            user_list.append(user_dict)
        
        return jsonify({
            'success': True,
            'users': user_list,
            'total': len(user_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/waitlist/create', methods=['POST'])
@jwt_required()
def create_waitlist_user():
    """Create a new waitlist user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        source = data.get('source', 'admin')
        
        if not email or not name:
            return jsonify({'error': 'Email and name are required'}), 400
        
        session = db.session
        
        # Check if user already exists
        existing = session.execute(
            text("SELECT id FROM waitlist WHERE email = :email"),
            {'email': email}
        ).fetchone()
        
        if existing:
            return jsonify({'error': 'Email already exists in waitlist'}), 400
        
        # Insert new user
        session.execute(text("""
            INSERT INTO waitlist (email, name, source, status, created_at)
            VALUES (:email, :name, :source, 'pending', NOW())
        """), {
            'email': email,
            'name': name,
            'source': source
        })
        session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Created waitlist user: {email}',
            'user': {
                'email': email,
                'name': name,
                'status': 'pending',
                'source': source
            }
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/waitlist/edit/<email>', methods=['PUT'])
@jwt_required()
def edit_waitlist_user(email):
    """Edit waitlist user information"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
        data = request.get_json()
        new_name = data.get('name')
        new_email = data.get('email')
        
        session = db.session
        
        # Check if user exists
        user = session.execute(
            text("SELECT id, name, email FROM waitlist WHERE email = :email"),
            {'email': email}
        ).fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        updates = []
        params = {'email': email}
        
        if new_name:
            updates.append("name = :new_name")
            params['new_name'] = new_name
            
        if new_email:
            # Check if new email already exists
            existing = session.execute(
                text("SELECT id FROM waitlist WHERE email = :new_email AND email != :email"),
                {'new_email': new_email, 'email': email}
            ).fetchone()
            
            if existing:
                return jsonify({'error': 'New email already exists'}), 400
                
            updates.append("email = :new_email")
            params['new_email'] = new_email
        
        if not updates:
            return jsonify({'error': 'No changes specified'}), 400
        
        # Update user
        query = f"UPDATE waitlist SET {', '.join(updates)} WHERE email = :email"
        session.execute(text(query), params)
        session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Updated user {email}',
            'changes': {
                'name': f"{user.name} → {new_name}" if new_name else None,
                'email': f"{email} → {new_email}" if new_email else None
            }
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/waitlist/status/<email>', methods=['PUT'])
@jwt_required()
def change_user_status(email):
    """Change user status"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
        data = request.get_json()
        new_status = data.get('status')
        
        valid_statuses = ['pending', 'approved', 'signed_up', 'rejected']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        session = db.session
        
        # Check if user exists
        user = session.execute(
            text("SELECT id, status FROM waitlist WHERE email = :email"),
            {'email': email}
        ).fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        old_status = user.status
        
        if old_status == new_status:
            return jsonify({'error': f'User already has status: {new_status}'}), 400
        
        # Update status
        if new_status == 'pending':
            # Clear approval fields when reverting to pending
            session.execute(text("""
                UPDATE waitlist 
                SET status = :status, approved_at = NULL, approved_by = NULL
                WHERE email = :email
            """), {'status': new_status, 'email': email})
        else:
            session.execute(text("""
                UPDATE waitlist 
                SET status = :status
                WHERE email = :email
            """), {'status': new_status, 'email': email})
        
        session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Changed {email} status: {old_status} → {new_status}',
            'old_status': old_status,
            'new_status': new_status
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/waitlist/approve/<email>', methods=['POST'])
@jwt_required()
def approve_user_admin(email):
    """Approve user and send signup email (admin version)"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
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
        waitlist_user.approved_by = admin_user.email
        
        db.session.commit()
        
        # Send approval email
        email_sent = send_approval_email(email, token)
        
        return jsonify({
            'success': True,
            'message': f'Approved user: {email}',
            'token': token,
            'signup_url': f"https://app.moneyclip.money/auth?token={token}",
            'expires_at': expires_at.isoformat(),
            'email_sent': email_sent
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/waitlist/delete/<email>', methods=['DELETE'])
@jwt_required()
def delete_waitlist_user(email):
    """Delete user from waitlist"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
        session = db.session
        
        # Check if user exists
        user = session.execute(
            text("SELECT id FROM waitlist WHERE email = :email"),
            {'email': email}
        ).fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Delete related signup tokens first
        session.execute(text("""
            DELETE FROM signup_tokens WHERE email = :email
        """), {'email': email})
        
        # Delete user
        session.execute(text("""
            DELETE FROM waitlist WHERE email = :email
        """), {'email': email})
        
        session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Deleted user: {email}'
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/tokens/list', methods=['GET'])
@jwt_required()
def list_signup_tokens():
    """List all signup tokens"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user is admin
        admin_user = User.query.get(int(current_user_id))
        # Temporary: Allow any authenticated user as admin for demo purposes
        if not admin_user:
            return jsonify({'error': 'Authentication required'}), 401
        # Skip admin check temporarily - allow any logged in user
        # TODO: Re-enable proper admin check after database migration
        
        session = db.session
        tokens = session.execute(text("""
            SELECT email, token, expires_at, used_at, created_at
            FROM signup_tokens 
            ORDER BY created_at DESC
        """)).fetchall()
        
        token_list = []
        for token in tokens:
            status = "used" if token.used_at else ("expired" if token.expires_at < datetime.utcnow() else "active")
            
            token_dict = {
                'email': token.email,
                'token': token.token,
                'status': status,
                'expires_at': token.expires_at.isoformat() if token.expires_at else None,
                'used_at': token.used_at.isoformat() if token.used_at else None,
                'created_at': token.created_at.isoformat() if token.created_at else None,
                'signup_url': f"https://app.moneyclip.money/auth?token={token.token}" if status == "active" else None
            }
            token_list.append(token_dict)
        
        return jsonify({
            'success': True,
            'tokens': token_list,
            'total': len(token_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500