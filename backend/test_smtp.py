#!/usr/bin/env python3
"""
Test SMTP directly with the production configuration
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_smtp():
    """Test SMTP configuration directly"""
    
    # Production SMTP settings (from Railway environment)
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_username = 'moneyclipapp@gmail.com'
    smtp_password = 'tsof uusn dicz yfpe'  # Gmail app password
    
    recipient = 'cjohnkim+railway@gmail.com'
    
    print("🧪 Testing SMTP Configuration")
    print("=" * 40)
    print(f"Server: {smtp_server}:{smtp_port}")
    print(f"Username: {smtp_username}")
    print(f"Recipient: {recipient}")
    print()
    
    try:
        # Create test message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "🧪 SMTP Test - Money Clip"
        msg['From'] = smtp_username
        msg['To'] = recipient
        
        html_body = """
        <html>
        <body>
            <h2>🧪 SMTP Test Successful!</h2>
            <p>This email confirms that the SMTP configuration is working correctly.</p>
            <p>If you received this, the email system is functional.</p>
            <hr>
            <small>Money Clip SMTP Test</small>
        </body>
        </html>
        """
        
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send email
        print("📤 Connecting to SMTP server...")
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            print("🔗 Connected!")
            server.starttls()
            print("🔒 TLS started")
            server.login(smtp_username, smtp_password)
            print("✅ Login successful")
            server.send_message(msg)
            print("📨 Email sent successfully!")
        
        print("\n✅ SMTP test completed!")
        print(f"Check {recipient} for the test email.")
        return True
        
    except Exception as e:
        print(f"❌ SMTP test failed: {e}")
        return False

if __name__ == "__main__":
    test_smtp()