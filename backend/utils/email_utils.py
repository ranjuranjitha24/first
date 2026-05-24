import smtplib
from email.message import EmailMessage
import os
import traceback

def verify_email_connection():
    """
    Verifies the SMTP connection and credentials.
    Similar to transporter.verify() in Nodemailer.
    """
    print("\n--- [EMAIL DEBUG] Verifying SMTP Connection ---")
    
    # 6. Use this exact environment variable naming
    user = os.environ.get("EMAIL_USER") or os.environ.get("MAIL_USERNAME")
    password = os.environ.get("EMAIL_PASS") or os.environ.get("MAIL_PASSWORD")
    
    # 2. Add logs for EMAIL_USER and EMAIL_PASS loaded or not
    print(f"[EMAIL DEBUG] EMAIL_USER loaded: {'YES' if user else 'NO'} ({user if user else 'N/A'})")
    print(f"[EMAIL DEBUG] EMAIL_PASS loaded: {'YES' if password else 'NO'} (Length: {len(password) if password else 0})")
    
    if not user or not password:
        print("[EMAIL DEBUG ERROR] Missing email credentials in environment variables.")
        return False
        
    try:
        # 7. Verify Gmail SMTP configuration
        print("[EMAIL DEBUG] Attempting to connect to smtp.gmail.com:465 (SSL)...")
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as server:
            server.set_debuglevel(1) # Enables verbose SMTP logging
            print("[EMAIL DEBUG] Connection successful. Attempting login...")
            # 8. Ensure app password authentication is used correctly
            server.login(user, password)
            print("[EMAIL DEBUG] Login successful! Credentials are correct.")
        print("--- [EMAIL DEBUG] Verification Complete ---\n")
        return True
    except smtplib.SMTPAuthenticationError:
        print("[EMAIL DEBUG ERROR] Authentication failed. Please check if your App Password is correct and 2FA is enabled.")
        return False
    except Exception as e:
        print(f"[EMAIL DEBUG ERROR] Connection or login failed: {e}")
        traceback.print_exc()
        return False

def send_reset_email(to_email: str, reset_link: str) -> bool:
    print("\n--- [EMAIL DEBUG] Starting Email Send Process ---")
    
    user = os.environ.get("EMAIL_USER") or os.environ.get("MAIL_USERNAME")
    password = os.environ.get("EMAIL_PASS") or os.environ.get("MAIL_PASSWORD")

    print(f"[EMAIL DEBUG] EMAIL_USER loaded: {'YES' if user else 'NO'}")
    print(f"[EMAIL DEBUG] EMAIL_PASS loaded: {'YES' if password else 'NO'}")
    
    if not user or not password:
        print("[EMAIL DEBUG ERROR] Environment variables EMAIL_USER or EMAIL_PASS are missing.")
        return False

    # 2. Logs for recipient and link
    print(f"[EMAIL DEBUG] Recipient Email: {to_email}")
    print(f"[EMAIL DEBUG] Reset Link: {reset_link}")

    msg = EmailMessage()
    msg['Subject'] = 'Password Reset Request'
    msg['From'] = f"RecruiterPro HR <{user}>"
    msg['To'] = to_email

    msg.set_content(f"""\
Hello,

You have requested to reset your password for your RecruiterPro account.

Please click the link below to securely reset your password:
{reset_link}

This link will expire in 1 hour. If you did not request this, please ignore this email.

Best regards,
RecruiterPro Team
""")

    # 4. Use proper try-catch handling
    try:
        print("[EMAIL DEBUG] Establishing SSL connection to smtp.gmail.com...")
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as server:
            # server.set_debuglevel(1) # Uncomment for full raw SMTP logs if still failing
            print("[EMAIL DEBUG] Logging in...")
            server.login(user, password)
            
            print("[EMAIL DEBUG] Sending message...")
            server.send_message(msg)
            
        # 2. Mail success response
        print("[EMAIL DEBUG SUCCESS] Email sent successfully!")
        print("--- [EMAIL DEBUG] End Process ---\n")
        return True
        
    except Exception as e:
        # 2 & 9. Full mail sending errors / production safe error handling
        print("\n[EMAIL DEBUG FATAL ERROR] Failed to send email.")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print("Stack Trace:")
        traceback.print_exc()
        print("--- [EMAIL DEBUG] End Process with ERROR ---\n")
        return False
