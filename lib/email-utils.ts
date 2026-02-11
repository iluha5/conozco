/**
 * Email template utilities
 */

interface EmailTemplateProps {
    title: string;
    preheader: string;
    heading: string;
    bodyText: string;
    buttonText: string;
    buttonUrl: string;
    footerText?: string;
    expiryText?: string;
}

/**
 * Base HTML email template with consistent styling
 */
export function getBaseEmailTemplate(props: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${props.title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a202c; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; }
    .content p { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #667eea; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button:hover { background-color: #5a67d8; }
    .link-box { background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 24px 0; word-break: break-all; }
    .link-box a { color: #667eea; text-decoration: none; font-size: 14px; }
    .expiry { color: #718096; font-size: 14px; margin: 20px 0; }
    .footer { background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #a0aec0; font-size: 13px; margin: 8px 0; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${props.preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1>Conozco</h1>
    </div>
    <div class="content">
      <h2>${props.heading}</h2>
      <p>${props.bodyText}</p>
      <div class="button-container">
        <a href="${props.buttonUrl}" class="button">${props.buttonText}</a>
      </div>
      ${props.expiryText ? `<p class="expiry">⏰ ${props.expiryText}</p>` : ''}
      <div class="link-box">
        <p style="margin:0 0 8px 0;color:#718096;font-size:13px;">Or copy and paste this link:</p>
        <a href="${props.buttonUrl}">${props.buttonUrl}</a>
      </div>
    </div>
    <div class="footer">
      <p>${props.footerText || "If you didn't request this email, you can safely ignore it."}</p>
      <p style="color:#cbd5e0;">© ${new Date().getFullYear()} Conozco. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email verification template
 */
export function getVerificationEmailHtml(verificationUrl: string): {
    subject: string;
    html: string;
} {
    return {
        subject: 'Verify your email address - Conozco',
        html: getBaseEmailTemplate({
            title: 'Verify Your Email - Conozco',
            preheader:
                'Please verify your email address to complete registration',
            heading: 'Welcome to Conozco! 👋',
            bodyText:
                'Thank you for signing up. To get started with learning languages, please verify your email address by clicking the button below.',
            buttonText: 'Verify Email Address',
            buttonUrl: verificationUrl,
            expiryText: 'This link will expire in 24 hours.',
            footerText:
                "If you didn't create a Conozco account, please ignore this email.",
        }),
    };
}

/**
 * Password reset template
 */
export function getPasswordResetEmailHtml(resetUrl: string): {
    subject: string;
    html: string;
} {
    return {
        subject: 'Reset your password - Conozco',
        html: getBaseEmailTemplate({
            title: 'Reset Your Password - Conozco',
            preheader: 'You requested to reset your password',
            heading: 'Password Reset Request 🔐',
            bodyText:
                "We received a request to reset your password. Click the button below to create a new password. If you didn't make this request, you can safely ignore this email.",
            buttonText: 'Reset Password',
            buttonUrl: resetUrl,
            expiryText: 'This link will expire in 1 hour.',
            footerText:
                "If you didn't request a password reset, your password will remain unchanged.",
        }),
    };
}

/**
 * Welcome email template (sent after successful verification)
 */
export function getWelcomeEmailHtml(loginUrl: string): {
    subject: string;
    html: string;
} {
    return {
        subject: 'Welcome to Conozco! 🎉',
        html: getBaseEmailTemplate({
            title: 'Welcome to Conozco',
            preheader: 'Your account is ready!',
            heading: "You're all set! 🎉",
            bodyText:
                'Your email has been verified and your account is ready to use. Start building your vocabulary and mastering new languages today!',
            buttonText: 'Go to Dashboard',
            buttonUrl: loginUrl,
            footerText: 'Happy learning!',
        }),
    };
}
