"""
Money Clip MVP - Support Routes

Handles support request submissions and routing
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models_simple import db, User
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

support_bp = Blueprint('support', __name__)

@support_bp.route('/request', methods=['POST'])
@jwt_required()
def submit_support_request():
    """Submit a support request"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data or not data.get('subject') or not data.get('message'):
            return jsonify({'error': 'Subject and message are required'}), 400
        
        subject = data['subject']
        message = data['message']
        priority = data.get('priority', 'medium')
        user_name = data.get('user_name', user.first_name or 'User')
        
        # For MVP: Log the request and return success
        # In production, this would send an actual email
        print(f"🎧 SUPPORT REQUEST RECEIVED")
        print(f"From: {user.email} ({user_name})")
        print(f"Subject: {subject}")
        print(f"Priority: {priority}")
        print(f"Message: {message}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("=" * 50)
        
        # TODO: In production, implement actual email sending
        # try:
        #     send_support_email(user.email, user_name, subject, message, priority)
        # except Exception as e:
        #     print(f"Failed to send email: {e}")
        
        return jsonify({
            'message': 'Support request submitted successfully',
            'request_id': f"REQ-{datetime.now().strftime('%Y%m%d')}-{user_id}",
            'status': 'received'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to submit support request: {str(e)}'}), 500


def send_support_email(user_email, user_name, subject, message, priority):
    """Send support request email (placeholder for production)"""
    # This is a placeholder function for actual email integration
    # In production, you would configure SMTP settings and send real emails
    
    support_email = "cjohnkim+support-money-clip@gmail.com"
    
    email_subject = f"[Clip Support - {priority.upper()}] {subject}"
    email_body = f"""
    New support request from Clip user:
    
    User: {user_name} ({user_email})
    Priority: {priority}
    Subject: {subject}
    
    Message:
    {message}
    
    ---
    Sent from Clip Support System
    {datetime.now().isoformat()}
    """
    
    # TODO: Implement actual SMTP sending
    print(f"Would send email to: {support_email}")
    print(f"Subject: {email_subject}")
    print(f"Body: {email_body}")


@support_bp.route('/status/<request_id>', methods=['GET'])
@jwt_required()
def get_support_status(request_id):
    """Get support request status (placeholder)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # For MVP: Return a mock status
        return jsonify({
            'request_id': request_id,
            'status': 'received',
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'message': 'Your support request has been received and will be reviewed within 24 hours.'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get support status: {str(e)}'}), 500