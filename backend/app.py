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

# Import models first - use simplified models
from models_simple import db, User, Account, Transaction, RecurringItem, Budget
from models_simple import Waitlist, SignupToken

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
from routes.migration import migration_bp
from routes.transactions import transactions_bp
from routes.daily_allowance import daily_allowance_bp
from routes.plaid import plaid_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(planning_bp, url_prefix='/api/planning')
app.register_blueprint(calculation_bp, url_prefix='/api/calculation')
app.register_blueprint(athletic_bp, url_prefix='/api/athletic')
app.register_blueprint(waitlist_bp, url_prefix='/api/waitlist')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(migration_bp, url_prefix='/api/migration')
app.register_blueprint(transactions_bp)
app.register_blueprint(daily_allowance_bp)
app.register_blueprint(plaid_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if db else 'disconnected',
        'version': 'debug-v2',
        'latest_commit': 'bca2cb1'
    })

# Global counter to track requests
request_counter = 0

@app.route('/api/debug/ping', methods=['GET', 'POST'])
def debug_ping():
    """Debug endpoint to see if website is reaching server"""
    global request_counter
    request_counter += 1
    
    return jsonify({
        'ping': 'pong',
        'counter': request_counter,
        'timestamp': datetime.now().isoformat(),
        'method': request.method,
        'headers': dict(request.headers),
        'data': request.get_json() if request.method == 'POST' else None
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
            'signup_url': f"https://app.moneyclip.money/auth.html?token={token}",
            'expires_at': expires_at.isoformat(),
            'email_sent': email_sent
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Approval failed: {str(e)}'}), 500

@app.route('/signup/<token>')
def signup_page(token):
    """Serve signup page directly from backend"""
    return f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Money Clip Signup</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
        }}
        .signup-container {{ 
            background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 500px; width: 100%; overflow: hidden;
        }}
        .header {{ 
            background: linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%);
            color: white; padding: 40px 30px; text-align: center;
        }}
        .header h1 {{ font-size: 2rem; margin-bottom: 10px; }}
        .header p {{ opacity: 0.9; font-size: 1.1rem; }}
        .form-container {{ padding: 40px 30px; }}
        .form-group {{ margin-bottom: 20px; }}
        .form-group label {{ display: block; margin-bottom: 8px; font-weight: 600; color: #0a2540; }}
        .form-group input {{ 
            width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;
            font-size: 16px; transition: border-color 0.2s ease;
        }}
        .form-group input:focus {{ outline: none; border-color: #059669; }}
        .submit-btn {{ 
            width: 100%; background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white; border: none; padding: 16px; border-radius: 8px;
            font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s ease;
        }}
        .submit-btn:hover {{ transform: translateY(-2px); }}
        .submit-btn:disabled {{ opacity: 0.6; cursor: not-allowed; transform: none; }}
        .alert {{ padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; }}
        .alert.error {{ background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }}
        .alert.success {{ background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0; }}
    </style>
</head>
<body>
    <div class="signup-container">
        <div class="header">
            <h1>🏆 Welcome to Money Clip!</h1>
            <p>Complete your account setup to start your financial athletics journey</p>
        </div>
        
        <div class="form-container">
            <div id="alert" class="alert"></div>
            
            <form id="signupForm">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" readonly>
                </div>
                
                <div class="form-group">
                    <label for="password">Create Password</label>
                    <input type="password" id="password" name="password" placeholder="8+ chars, uppercase, lowercase, number, symbol">
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password">
                </div>
                
                <button type="submit" id="submitBtn" class="submit-btn">
                    Create Account
                </button>
            </form>
        </div>
    </div>

    <script>
        const token = "{token}";
        
        async function validateToken() {{
            try {{
                const response = await fetch(`https://clip-mvp-production.up.railway.app/api/waitlist/validate-token/${{token}}`);
                const data = await response.json();
                
                if (data.valid) {{
                    document.getElementById('email').value = data.email;
                }} else {{
                    showAlert(data.error || 'Invalid or expired token', 'error');
                }}
            }} catch (error) {{
                showAlert('Unable to validate token. Please try again.', 'error');
            }}
        }}
        
        function showAlert(message, type) {{
            const alert = document.getElementById('alert');
            alert.textContent = message;
            alert.className = `alert ${{type}}`;
            alert.style.display = 'block';
        }}
        
        document.getElementById('signupForm').addEventListener('submit', async (e) => {{
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');
            
            if (password !== confirmPassword) {{
                showAlert('Passwords do not match', 'error');
                return;
            }}
            
            if (password.length < 8) {{
                showAlert('Password must be at least 8 characters', 'error');
                return;
            }}
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
            
            try {{
                const response = await fetch('https://clip-mvp-production.up.railway.app/api/waitlist/signup-with-token', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{ token: token, password: password }})
                }});
                
                const data = await response.json();
                
                if (data.success) {{
                    showAlert('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {{
                        window.location.href = 'https://app.moneyclip.money/';
                    }}, 2000);
                }} else {{
                    showAlert(data.error || 'Failed to create account', 'error');
                }}
            }} catch (error) {{
                showAlert('Unable to create account. Please try again.', 'error');
            }} finally {{
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }}
        }});
        
        validateToken();
    </script>
</body>
</html>
    '''

@app.route('/api/debug-token/<token>')
def debug_token(token):
    """Debug token data types"""
    try:
        from models import SignupToken
        signup_token = SignupToken.query.filter_by(token=token).first()
        
        if not signup_token:
            return jsonify({'error': 'Token not found'})
        
        return jsonify({
            'token': token,
            'email': signup_token.email,
            'expires_at': str(signup_token.expires_at),
            'expires_at_type': str(type(signup_token.expires_at)),
            'used_at': str(signup_token.used_at),
            'used_at_type': str(type(signup_token.used_at)),
            'now': str(datetime.utcnow()),
            'now_type': str(type(datetime.utcnow())),
            'comparison': signup_token.expires_at < datetime.utcnow() if signup_token.expires_at else 'N/A'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/debug-waitlist-flow', methods=['POST'])
def debug_waitlist_flow():
    """Debug the complete waitlist signup flow"""
    try:
        from routes.waitlist import send_waitlist_confirmation_email
        from models import Waitlist
        
        data = request.get_json() or {}
        email = data.get('email', 'cjohnkim+debug@gmail.com')
        name = data.get('name', 'Debug User')
        
        # Check if email exists
        existing = Waitlist.query.filter_by(email=email).first()
        
        debug_info = {
            'email': email,
            'name': name,
            'existing_in_db': bool(existing),
            'existing_details': str(existing) if existing else None
        }
        
        if existing:
            return jsonify({
                'error': 'Email already exists in waitlist',
                'debug': debug_info
            })
        
        # Try to send email without adding to DB
        print(f"Debug: Attempting to send email to {email}")
        email_result = send_waitlist_confirmation_email(email, name)
        print(f"Debug: Email send result: {email_result}")
        
        debug_info['email_send_attempt'] = email_result
        
        return jsonify({
            'success': True,
            'message': 'Debug email sent (not added to waitlist)',
            'debug': debug_info
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        return jsonify({
            'error': str(e),
            'traceback': error_trace
        }), 500

@app.route('/api/test-waitlist-email', methods=['POST'])
def test_waitlist_email():
    """Test waitlist confirmation email directly"""
    try:
        from routes.waitlist import send_waitlist_confirmation_email
        
        data = request.get_json() or {}
        email = data.get('email', 'cjohnkim@gmail.com')
        name = data.get('name', 'Test User')
        
        print(f"Testing waitlist email to {email} with name {name}")
        
        result = send_waitlist_confirmation_email(email, name)
        
        return jsonify({
            'success': result,
            'message': f'Waitlist confirmation email {"sent" if result else "failed"} to {email}',
            'email': email,
            'name': name
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to test waitlist email: {str(e)}'}), 500

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