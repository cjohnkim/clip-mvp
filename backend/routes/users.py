"""
Money Clip MVP - Users Routes

Handles user profile management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models_simple import db, User
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get extended user profile information"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # For MVP: Return basic profile with placeholders for extended fields
        profile_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': '',  # TODO: Add to User model
            'phone': '',      # TODO: Add to User model  
            'address': '',    # TODO: Add to User model
            'profile_picture': '',  # TODO: Add to User model
            'identity_documents': [],  # TODO: Add separate model
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'is_admin': user.is_admin
        }
        
        return jsonify({
            'user': profile_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update user profile information"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name'].strip() if data['first_name'] else None
        
        # TODO: Add these fields to User model when ready
        # if 'last_name' in data:
        #     user.last_name = data['last_name'].strip()
        # if 'phone' in data:
        #     user.phone = data['phone'].strip()
        # if 'address' in data:
        #     user.address = data['address'].strip()
        
        # Note: Email changes should require verification
        # Profile pictures and documents need file upload handling
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500


@users_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        new_password = data['new_password']
        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400
        
        # Set new password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to change password: {str(e)}'}), 500


@users_bp.route('/upload-document', methods=['POST'])
@jwt_required()
def upload_identity_document():
    """Upload identity document (placeholder for file upload)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # TODO: Implement file upload handling
        # This would involve:
        # 1. Validate file type (images only)
        # 2. Secure file storage (AWS S3, etc.)
        # 3. Database storage of file references
        # 4. Document verification workflow
        
        return jsonify({
            'message': 'Document upload feature coming soon',
            'status': 'not_implemented'
        }), 501
        
    except Exception as e:
        return jsonify({'error': f'Failed to upload document: {str(e)}'}), 500