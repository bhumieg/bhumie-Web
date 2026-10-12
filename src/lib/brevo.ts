// Brevo (Sendinblue) Transactional Email Service

export interface SendEmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export function generateOtp(): string {
  // Generate random 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendEmailViaBrevo({
  toEmail,
  toName,
  subject,
  htmlContent,
}: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'ghark247@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Bhumie';

  // If Brevo API key is not yet configured, provide developer fallback
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_brevo')) {
    console.log(`\n======================================================`);
    console.log(`[BREVO EMAIL SIMULATOR (Set BREVO_API_KEY in .env to send real emails)]`);
    console.log(`To: ${toEmail} (${toName || 'User'})`);
    console.log(`Subject: ${subject}`);
    console.log(`Message Preview:\n${htmlContent.replace(/<[^>]*>?/gm, ' ').substring(0, 300)}...`);
    console.log(`======================================================\n`);

    return {
      success: true,
      messageId: `dev-simulated-${Date.now()}`,
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Brevo API Error:', errorData);
      return {
        success: false,
        error: errorData.message || `Brevo API HTTP error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: any) {
    console.error('Failed to send email via Brevo:', err);
    return {
      success: false,
      error: err.message || 'Unknown network error',
    };
  }
}

export async function sendOtpEmail(email: string, otp: string, purpose: string = 'Login'): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background: #315bef; padding: 28px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px 28px; color: #333333; line-height: 1.6; }
        .otp-box { background: #f0f4ff; border: 2px dashed #315bef; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #315bef; font-family: monospace; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        .note { font-size: 13px; color: #666666; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bhumie</h1>
          <p>Your Next Perfect Place</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a one-time verification code for <strong>${purpose}</strong> on Bhumie.</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="note">This code will expire in <strong>10 minutes</strong>. If you did not request this OTP, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bhumie Real Estate Portal. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmailViaBrevo({
    toEmail: email,
    subject: `Your Bhumie Verification Code: ${otp}`,
    htmlContent: html,
  });

  return result;
}

export async function sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background: #315bef; padding: 28px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; color: #333333; line-height: 1.6; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bhumie</h1>
          <p>Find Your Next Perfect Place</p>
        </div>
        <div class="content">
          <h2>Welcome, ${name || 'User'}! 🎉</h2>
          <p>Your account on Bhumie has been successfully created. You can now explore verified rental and sale properties, connect directly with property owners via real-time chat, and list your own properties for free.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bhumie Real Estate Portal. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmailViaBrevo({
    toEmail: email,
    toName: name,
    subject: `Welcome to Bhumie! 🏡`,
    htmlContent: html,
  });
}

export async function sendNotificationEmail(
  toEmail: string,
  subject: string,
  message: string,
  toName?: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background: #315bef; padding: 24px; text-align: center; color: white; }
        .content { padding: 28px; color: #333333; line-height: 1.6; }
        .footer { padding: 18px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Bhumie Notification</h2>
        </div>
        <div class="content">
          <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bhumie Real Estate Portal. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmailViaBrevo({
    toEmail,
    toName,
    subject,
    htmlContent: html,
  });
}

