"""
Database Migration Routes for Production
"""

from flask import Blueprint, jsonify
from models_simple import db
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

migrate_bp = Blueprint('migrate', __name__, url_prefix='/api/migrate')

@migrate_bp.route('/schema', methods=['POST'])
def migrate_schema():
    """Run database schema migrations safely"""
    try:
        migrations_run = []
        
        # Add recurrence fields to transactions table if they don't exist
        try:
            db.session.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN recurrence_type VARCHAR(20)
            """))
            migrations_run.append("Added recurrence_type column")
        except Exception as e:
            logger.info(f"recurrence_type column already exists or error: {e}")
        
        try:
            db.session.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN recurrence_interval INTEGER DEFAULT 1
            """))
            migrations_run.append("Added recurrence_interval column")
        except Exception as e:
            logger.info(f"recurrence_interval column already exists or error: {e}")
        
        try:
            db.session.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN notes TEXT
            """))
            migrations_run.append("Added notes column")
        except Exception as e:
            logger.info(f"notes column already exists or error: {e}")
        
        # Add include_in_total column to accounts if it doesn't exist
        try:
            db.session.execute(text("""
                ALTER TABLE accounts 
                ADD COLUMN include_in_total BOOLEAN DEFAULT TRUE
            """))
            migrations_run.append("Added include_in_total column to accounts")
        except Exception as e:
            logger.info(f"include_in_total column already exists or error: {e}")
        
        # Add plaid_account_id column to accounts if it doesn't exist
        try:
            db.session.execute(text("""
                ALTER TABLE accounts 
                ADD COLUMN plaid_account_id VARCHAR(255)
            """))
            migrations_run.append("Added plaid_account_id column to accounts")
        except Exception as e:
            logger.info(f"plaid_account_id column already exists or error: {e}")
        
        # Add institution_name column to accounts if it doesn't exist
        try:
            db.session.execute(text("""
                ALTER TABLE accounts 
                ADD COLUMN institution_name VARCHAR(100)
            """))
            migrations_run.append("Added institution_name column to accounts")
        except Exception as e:
            logger.info(f"institution_name column already exists or error: {e}")
        
        # Add plaid_transaction_id column to transactions if it doesn't exist
        try:
            db.session.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN plaid_transaction_id VARCHAR(255)
            """))
            migrations_run.append("Added plaid_transaction_id column to transactions")
        except Exception as e:
            logger.info(f"plaid_transaction_id column already exists or error: {e}")
        
        # Add merchant_name column to transactions if it doesn't exist
        try:
            db.session.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN merchant_name VARCHAR(255)
            """))
            migrations_run.append("Added merchant_name column to transactions")
        except Exception as e:
            logger.info(f"merchant_name column already exists or error: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schema migration completed',
            'migrations_run': migrations_run
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Migration failed: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@migrate_bp.route('/create-tables', methods=['POST'])
def create_tables():
    """Create all tables if they don't exist"""
    try:
        db.create_all()
        return jsonify({
            'success': True,
            'message': 'All tables created/verified'
        })
    except Exception as e:
        logger.error(f"Table creation failed: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@migrate_bp.route('/production-fix', methods=['POST'])
def production_fix():
    """Run complete production database fix"""
    try:
        from production_fix import fix_production_database
        success = fix_production_database()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Production database fixed successfully',
                'user_created': 'cjohnkim@gmail.com with password SimpleClip123'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Production fix failed'
            }), 500
            
    except Exception as e:
        logger.error(f"Production fix error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@migrate_bp.route('/status', methods=['GET'])
def migration_status():
    """Check database schema status"""
    try:
        # Test if new columns exist by running a simple query
        result = db.session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in result]
        
        # Check for required columns
        column_checks = []
        
        if 'transactions' in tables:
            result = db.session.execute(text("PRAGMA table_info(transactions)"))
            tx_columns = [row[1] for row in result]
            column_checks.append({
                'table': 'transactions',
                'has_recurrence_type': 'recurrence_type' in tx_columns,
                'has_recurrence_interval': 'recurrence_interval' in tx_columns,
                'has_notes': 'notes' in tx_columns,
                'has_plaid_transaction_id': 'plaid_transaction_id' in tx_columns,
                'has_merchant_name': 'merchant_name' in tx_columns
            })
        
        if 'accounts' in tables:
            result = db.session.execute(text("PRAGMA table_info(accounts)"))
            acc_columns = [row[1] for row in result]
            column_checks.append({
                'table': 'accounts',
                'has_include_in_total': 'include_in_total' in acc_columns,
                'has_plaid_account_id': 'plaid_account_id' in acc_columns,
                'has_institution_name': 'institution_name' in acc_columns
            })
        
        return jsonify({
            'success': True,
            'tables': tables,
            'column_checks': column_checks
        })
        
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500