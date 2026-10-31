import nodemailer from "nodemailer";
import { env } from "./env.config.js";

interface SendEmailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

// TODO: Replace the env variales with actual smtp variables
const transporter = nodemailer.createTransport({
  host: env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: env.MAILTRAP_USER,
    pass: env.MAILTRAP_PASS,
  },
});

export async function sendEmail({
  from,
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: from || '"No Reply" <noreply@example.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export function verifyMailTemplate(code: number, url: string): string {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <!-- Container Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 20px;">
              <h2 style="color: #e0e7ff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; font-weight: 600;">
                SkillForge
              </h2>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
                Verify Your Email
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                Welcome to <strong>SkillForge</strong>! Please use the 4-digit code below and click the button to activate your learning account.
              </p>

              <!-- 4-Digit Code Box -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center" style="background-color: #f3f4f6; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 14px 32px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #1e293b; letter-spacing: 10px;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>
              <!-- Call to Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto;">
                <tr>
                  <td align="center" bgcolor="#4f46e5" style="border-radius: 8px;">
                    <a href="${url}" target="_blank" style="font-size: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 1px solid #4f46e5; display: inline-block; font-weight: 600;">
                      Verify Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 13px; line-height: 18px; margin: 0 0 8px 0;">
                This code and link will expire in <strong>10 minutes</strong>.
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 16px; margin: 0;">
                If you did not request this email, please safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} SkillForge Learning Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}
