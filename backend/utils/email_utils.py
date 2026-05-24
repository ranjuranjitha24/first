import smtplib
from email.message import EmailMessage
import os

def send_reset_email(to_email: str, reset_link: str):
    sender_email = os.environ.get("MAIL_USERNAME")
    sender_password = os.environ.get("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("Warning: MAIL_USERNAME or MAIL_PASSWORD not set. Cannot send email.")
        return False

    msg = EmailMessage()
    msg['Subject'] = 'Password Reset Request'
    msg['From'] = f"RecruiterPro HR <{sender_email}>"
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

    # Try sending using Gmail SMTP
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
