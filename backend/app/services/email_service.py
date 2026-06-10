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
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        return False  # Email not configured

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
