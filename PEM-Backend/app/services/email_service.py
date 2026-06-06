import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings


def send_otp_email(to_email: str, name: str, otp_code: str):
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:#111;padding:28px 40px;border-bottom:1px solid #2a2a2a;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size:22px;font-weight:800;color:#22c55e;letter-spacing:-0.5px;">&#8377; PEM</span>
                        <span style="font-size:12px;color:#666;margin-left:8px;">Personal Expense Manager</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f0f0f0;">
                    Verify your email &#128075;
                  </p>
                  <p style="margin:0 0 28px;font-size:14px;color:#888;line-height:1.6;">
                    Hi <strong style="color:#ccc;">{name}</strong>, use the code below to complete your PEM registration.
                    This code expires in <strong style="color:#ccc;">5 minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                    <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#666;">Your verification code</p>
                    <p style="margin:0;font-size:48px;font-weight:800;letter-spacing:12px;color:#22c55e;font-family:'Courier New',monospace;">
                      {otp_code}
                    </p>
                  </div>

                  <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
                    If you didn't create a PEM account, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #2a2a2a;background:#111;">
                  <p style="margin:0;font-size:12px;color:#444;text-align:center;">
                    Made by <strong style="color:#555;">Rudra J Rabadiya</strong> &nbsp;&middot;&nbsp; &#169; All Rights Reserved
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your PEM verification code"
    msg["From"]    = f"PEM <{settings.GMAIL_USER}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.GMAIL_USER, to_email, msg.as_string())
    except Exception as e:
        raise Exception(f"Gmail SMTP error: {str(e)}")
