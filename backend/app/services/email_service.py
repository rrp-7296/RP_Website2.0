"""
Email service for contact form notifications.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


async def send_contact_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
) -> bool:
    """Send email notification when a new contact form is submitted."""
    if not settings.SMTP_USER or not settings.SMTP_PASS or settings.SMTP_USER == "your-email@gmail.com":
        print("\n=== DEVELOPER MOCK SMTP CONTACT NOTIFICATION ===")
        print(f"From: {name} <{email}>")
        print(f"Subject: New Contact Form: {subject}")
        print(f"Message:\n{message}")
        print("================================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"New Contact Form: {subject}"
        msg["From"] = settings.SMTP_USER
        msg["To"] = settings.CONTACT_NOTIFY_EMAIL

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #FF6B00;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td>{name}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td>{email}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Subject:</td><td>{subject}</td></tr>
            </table>
            <h3>Message:</h3>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">{message}</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False


async def send_contact_reply(
    to_email: str,
    to_name: str,
    original_subject: str,
    reply_body: str,
) -> bool:
    """Send an email reply to a user's contact form query."""
    if not settings.SMTP_USER or not settings.SMTP_PASS or settings.SMTP_USER == "your-email@gmail.com":
        print("\n=== DEVELOPER MOCK SMTP EMAIL REPLY ===")
        print(f"To: {to_name} <{to_email}>")
        print(f"Subject: Re: {original_subject}")
        print(f"Body:\n{reply_body}")
        print("========================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Re: {original_subject}"
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333333;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #FF6B00; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">{settings.APP_NAME}</h2>
                </div>
                <div style="padding: 24px;">
                    <p style="font-size: 16px; margin-top: 0;">Dear {to_name},</p>
                    <p style="font-size: 15px; margin-bottom: 24px;">Thank you for contacting us. Here is our response to your query:</p>
                    
                    <div style="background: #fdf6f0; border-left: 4px solid #FF6B00; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 15px; white-space: pre-wrap; font-style: italic;">{reply_body}</p>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
                    
                    <div style="font-size: 12px; color: #888888;">
                        <p style="margin: 0 0 8px 0;"><strong>Original Subject:</strong> {original_subject}</p>
                        <p style="margin: 0;">This email was sent from the administration dashboard of {settings.APP_NAME}. Please do not reply to this email directly.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, "html"))

        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.send_message(msg)

        return True
    except Exception as e:
        print(f"Email reply send failed: {e}")
        return False

