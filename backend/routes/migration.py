"""
Money Clip MVP - Database Migration Routes

One-time migration endpoints for schema updates.
"""

from flask import Blueprint, request, jsonify
from sqlalchemy import text
from models_simple import db, User
import os

migration_bp = Blueprint('migration', __name__)

@migration_bp.route('/add-admin-column', methods=['POST'])
def add_admin_column():
    """Add is_admin column to users table and set admin for specific email"""
    try:
        # Security check - only allow this in development or with special key
        migration_key = request.headers.get('X-Migration-Key')
        expected_key = os.environ.get('MIGRATION_KEY', 'dev-migration-key-123')
        
        if migration_key != expected_key:
            return jsonify({'error': 'Invalid migration key'}), 403
        
        data = request.get_json()
        admin_email = data.get('admin_email', 'cjohnkim@gmail.com')
        
        session = db.session
        
        # Check if column already exists
        check_column = session.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='is_admin'
        """)).fetchone()
        
        if not check_column:
            print("Adding is_admin column to users table...")
            # Add the column
            session.execute(text("""
                ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
            """))
            session.commit()
            print("✅ Column added successfully")
        else:
            print("ℹ️  is_admin column already exists")
        
        # Set admin role for specified email
        result = session.execute(text("""
            UPDATE users SET is_admin = TRUE WHERE email = :email
        """), {'email': admin_email})
        
        session.commit()
        
        if result.rowcount > 0:
            print(f"✅ Set admin role for {admin_email}")
            admin_set = True
        else:
            print(f"⚠️  User {admin_email} not found")
            admin_set = False
        
        # Verify the user now has admin role
        user = User.query.filter_by(email=admin_email).first()
        if user:
            user_info = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
        else:
            user_info = None
        
        return jsonify({
            'success': True,
            'message': 'Migration completed successfully',
            'column_added': not bool(check_column),
            'admin_set': admin_set,
            'admin_email': admin_email,
            'user_info': user_info
        }), 200
        
    except Exception as e:
        session.rollback()
        return jsonify({
            'error': f'Migration failed: {str(e)}',
            'success': False
        }), 500

@migration_bp.route('/verify-admin', methods=['GET'])
def verify_admin():
    """Verify admin setup"""
    try:
        admin_email = request.args.get('email', 'cjohnkim@gmail.com')
        
        # Check if column exists
        session = db.session
        check_column = session.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='is_admin'
        """)).fetchone()
        
        column_exists = bool(check_column)
        
        # Check user
        user = User.query.filter_by(email=admin_email).first()
        
        if user:
            user_info = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'is_admin': getattr(user, 'is_admin', False),
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
        else:
            user_info = None
        
        return jsonify({
            'column_exists': column_exists,
            'user_exists': bool(user),
            'user_info': user_info,
            'admin_email': admin_email
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Verification failed: {str(e)}'
        }), 500