import urllib.request
import json
import os
import traceback

def verify_email_connection():
    """
    Verifies that the Resend API key is present.
    """
    print("\n--- [EMAIL DEBUG] Verifying Resend API Configuration ---")
    
    api_key = os.environ.get("RESEND_API_KEY")
    
    print(f"[EMAIL DEBUG] RESEND_API_KEY loaded: {'YES' if api_key else 'NO'} (Length: {len(api_key) if api_key else 0})")
    
    if not api_key:
        print("[EMAIL DEBUG ERROR] Missing RESEND_API_KEY in environment variables.")
        return False
        
    print("[EMAIL DEBUG] Configuration looks good. Ready to send emails via Resend API!")
    print("--- [EMAIL DEBUG] Verification Complete ---\n")
    return True

def send_reset_email(to_email: str, reset_link: str) -> bool:
    print("\n--- [EMAIL DEBUG] Starting Email Send Process via Resend API ---")
    
    api_key = os.environ.get("RESEND_API_KEY")

    print(f"[EMAIL DEBUG] RESEND_API_KEY loaded: {'YES' if api_key else 'NO'}")
    
    if not api_key:
        print("[EMAIL DEBUG ERROR] Environment variable RESEND_API_KEY is missing.")
        return False

    print(f"[EMAIL DEBUG] Recipient Email: {to_email}")
    print(f"[EMAIL DEBUG] Reset Link: {reset_link}")

    # For free Resend accounts, you must send from 'onboarding@resend.dev' 
    # and you can only send to the email address you registered with Resend.
    # If you verified your own domain, change this 'from' address.
    sender_email = "onboarding@resend.dev"

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "RecruiterPro-Backend/1.0"
    }
    
    data = {
        "from": f"RecruiterPro HR <{sender_email}>",
        "to": [to_email],
        "subject": "Password Reset Request",
        "html": f"""
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Password Reset</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for your RecruiterPro account.</p>
            <p>Please click the button below to securely reset your password:</p>
            <a href="{reset_link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; margin-bottom: 15px;">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{reset_link}">{reset_link}</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        </div>
        """
    }

    try:
        print("[EMAIL DEBUG] Making POST request to Resend API...")
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method="POST")
        
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print(f"[EMAIL DEBUG SUCCESS] Email sent successfully! Resend API Response: {res_body}")
            print("--- [EMAIL DEBUG] End Process ---\n")
            return True
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"\n[EMAIL DEBUG FATAL ERROR] Resend API rejected the request with HTTP {e.code}.")
        print(f"Error Body: {error_body}")
        print("--- [EMAIL DEBUG] End Process with ERROR ---\n")
        return False
    except Exception as e:
        print("\n[EMAIL DEBUG FATAL ERROR] Failed to send email via Resend API.")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        traceback.print_exc()
        print("--- [EMAIL DEBUG] End Process with ERROR ---\n")
        return False
