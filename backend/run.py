#!/usr/bin/env python3
"""
Money Clip MVP - Development Server

Run this script to start the Flask development server.
"""

import os
from app import app, db

if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
    
    # Run development server
    print("Starting Money Clip MVP backend...")
    print("API will be available at: http://localhost:8000/api")
    print("Health check: http://localhost:8000/api/health")
    
    app.run(debug=True, host='0.0.0.0', port=8000)