#!/usr/bin/env python3
"""
Simple email test script to verify SMTP configuration
Usage: python test_email.py your-email@domain.com
"""

import sys
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_email(recipient_email):
    """Test email sending with current SMTP configuration"""
    try:
        # Email configuration
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        print(f"📧 Testing email configuration:")
        print(f"   SMTP Server: {smtp_server}")
        print(f"   SMTP Port: {smtp_port}")
        print(f"   Username: {smtp_username}")
        print(f"   Password: {'*' * len(smtp_password) if smtp_password else 'NOT SET'}")
        print(f"   Recipient: {recipient_email}")
        print()
        
        if not smtp_username or not smtp_password:
            print("❌ Email credentials not configured")
            return False
        
        # Email content
        subject = "🧪 Money Clip Email Test"
        
        html_body = """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #0a2540;">📧 Email Test Successful!</h1>
                <p>This is a test email from Money Clip to verify SMTP configuration.</p>
                <p>If you received this email, the email system is working properly.</p>
                <hr>
                <small>Money Clip MVP - Test Email</small>
            </div>
        </body>
        </html>
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_username
        msg['To'] = recipient_email
        
        # Add HTML part
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send email
        print("📤 Attempting to send test email...")
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            print("🔗 Connecting to SMTP server...")
            server.starttls()
            print("🔒 Starting TLS...")
            server.login(smtp_username, smtp_password)
            print("✅ Login successful...")
            server.send_message(msg)
            print("📨 Email sent successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_email.py your-email@domain.com")
        sys.exit(1)
    
    recipient = sys.argv[1]
    print("🧪 Money Clip Email Test")
    print("=" * 50)
    
    success = test_email(recipient)
    
    if success:
        print("\n✅ Email test completed successfully!")
        print("Check your inbox for the test email.")
    else:
        print("\n❌ Email test failed.")
        print("Check your SMTP configuration and credentials.")