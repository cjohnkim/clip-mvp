#!/usr/bin/env python3
"""
Test endpoint to check environment variables on Railway
"""

from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/test-env')
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

if __name__ == '__main__':
    app.run(debug=True)