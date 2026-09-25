import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Helper to parse sender name and email from env.EMAIL_FROM
 * Example: "Safar <hello@safar.in>" -> { name: "Safar", email: "hello@safar.in" }
 */
function getSenderDetails() {
  const raw = env.EMAIL_FROM || process.env.EMAIL_FROM || 'Safar <noreply@safar.app>';
  const match = raw.match(/^(?:(.*?)<)?([^<>]+)>?$/);
  if (match) {
    const name = (match[1] || 'Safar').trim().replace(/^["']|["']$/g, '');
    const email = (match[2] || 'noreply@safar.app').trim();
    return { name: name || 'Safar', email };
  }
  return { name: 'Safar', email: raw.trim() };
}

/**
 * Generic Brevo transactional email dispatcher with dual transport:
 * 1. Primary: REST API (fastest, standard HTTPS)
 * 2. Fallback: SMTP Relay via nodemailer (smtp-relay.brevo.com:587)
 */
export async function sendTransactionalEmail({ toEmail, toName, subject, htmlContent, attachments = [] }) {
  if (process.env.NODE_ENV === 'test') {
    return { success: true, messageId: 'mock-test-message-id', method: 'mock' };
  }

  const apiKey = env.BREVO_API_KEY || process.env.BREVO_API_KEY || process.env.BREVO_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn(`[Email Service] BREVO_API_KEY not configured. Email to "${toEmail}" skipped.`);
    return { success: false, reason: 'BREVO_API_KEY_NOT_CONFIGURED' };
  }

  const sender = getSenderDetails();

  // 1. Try Brevo REST API v3
  try {
    const requestBody = {
      sender: {
        name: sender.name,
        email: sender.email,
      },
      to: [
        {
          email: toEmail.trim(),
          name: toName ? toName.trim() : toEmail.trim(),
        },
      ],
      subject,
      htmlContent,
    };

    if (attachments && attachments.length > 0) {
      requestBody.attachment = attachments.map((att) => ({
        name: att.name || att.filename || 'Safar-Trip-Plan.pdf',
        content: (att.content || att.base64 || '').replace(/^data:[^;]+;base64,/, ''),
      }));
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.messageId) {
      console.log(`[Email Service] Email sent successfully via REST API to ${toEmail}. MessageId:`, data.messageId);
      return { success: true, messageId: data.messageId, method: 'rest' };
    }

    console.warn('[Email Service] Brevo REST API failed, attempting SMTP fallback. Status:', response.status, data);
  } catch (restError) {
    console.warn('[Email Service] Brevo REST API error, trying SMTP fallback:', restError.message);
  }

  // 2. Try SMTP Relay fallback via nodemailer
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
      auth: {
        user: process.env.BREVO_SMTP_USER || sender.email,
        pass: apiKey.trim(),
      },
    });

    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: toEmail.trim(),
      subject,
      html: htmlContent,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att) => ({
        filename: att.name || att.filename || 'Safar-Trip-Plan.pdf',
        content: Buffer.from((att.content || att.base64 || '').replace(/^data:[^;]+;base64,/, ''), 'base64'),
        contentType: att.contentType || 'application/pdf',
      }));
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`[Email Service] Email sent successfully via SMTP to ${toEmail}. MessageId:`, info.messageId);
    return { success: true, messageId: info.messageId, method: 'smtp' };
  } catch (smtpError) {
    console.error('[Email Service] Both REST API and SMTP failed to send email:', smtpError.message);
    return { success: false, error: smtpError.message };
  }
}

/**
 * Welcome Email Template & Dispatcher
 */
export async function sendWelcomeEmail({ toEmail, userName }) {
  const displayName = userName || 'Traveler';
  const subject = `नमस्ते ${displayName}, Welcome to Safar! 🎒✨`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Safar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8e8ed;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); padding: 35px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                सफ़र • Safar
              </h1>
              <p style="color: rgba(255,255,255,0.92); margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">
                Smart AI-Powered Indian Travel Companion
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #1d1d1f;">
                नमस्ते ${displayName}! 🙏
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #48484a; margin: 0 0 20px 0;">
                We are thrilled to welcome you to <strong>Safar</strong>. Exploring India is now smarter, seamless, and completely tailored to your budget and travel style.
              </p>

              <!-- Features Box -->
              <div style="background-color: #fafafc; border: 1px solid #ededf2; border-radius: 14px; padding: 20px; margin: 24px 0;">
                <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #1d1d1f;">
                  What you can do with Safar:
                </h3>
                <ul style="padding-left: 20px; margin: 0; color: #48484a; font-size: 14px; line-height: 1.8;">
                  <li><strong>AI-Powered Itineraries:</strong> Generate day-by-day plans with accurate Indian travel routes.</li>
                  <li><strong>Real Cost Estimates:</strong> Accurate budget breakdowns in ₹ INR.</li>
                  <li><strong>Train, Bus & Flight Insights:</strong> Direct booking recommendations.</li>
                  <li><strong>Smart Packing & Tips:</strong> Curated local safety and pro travel advice.</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 10px 0;">
                <a href="${env.CORS_ORIGIN || 'http://localhost:3000'}/plan" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 980px; box-shadow: 0 4px 14px rgba(255, 107, 53, 0.35);">
                  Plan Your Next Trip →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #fafafc; border-top: 1px solid #ededf2; text-align: center; color: #86868b; font-size: 13px;">
              <p style="margin: 0 0 6px 0;">Happy Travels with Safar • Made with ❤️ for Indian Explorers</p>
              <p style="margin: 0; font-size: 11px; color: #a1a1a6;">
                If you did not sign up for Safar, please disregard this email.
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

  return sendTransactionalEmail({
    toEmail,
    toName: userName,
    subject,
    htmlContent,
  });
}

/**
 * 6-Digit OTP Password Reset Email
 */
export async function sendOtpEmail({ toEmail, userName, otp }) {
  const displayName = userName || 'Traveler';
  const subject = `Your Safar Password Reset Code: ${otp} 🔑`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8e8ed;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center; border-bottom: 1px solid #f2f2f5;">
              <h1 style="color: #ff6b35; margin: 0; font-size: 24px; font-weight: 800;">
                सफ़र • Safar
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 35px 30px; text-align: center;">
              <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: #1d1d1f;">
                Password Reset Verification
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #48484a; margin: 0 0 24px 0;">
                Hello ${displayName}, we received a request to reset your Safar account password. Use the 6-digit verification code below to complete the reset:
              </p>

              <!-- OTP Code Display -->
              <div style="background-color: #f8f9fa; border: 2px dashed #ff6b35; border-radius: 14px; padding: 18px 24px; display: inline-block; margin: 10px 0 24px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ff6b35; font-family: 'SF Mono', Consolas, monospace;">
                  ${otp}
                </span>
              </div>

              <p style="font-size: 13px; color: #86868b; margin: 0 0 16px 0;">
                ⏱️ This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="font-size: 12px; color: #a1a1a6; line-height: 1.5; margin: 0;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #fafafc; border-top: 1px solid #ededf2; text-align: center; color: #86868b; font-size: 12px;">
              Safar Security Alert • Keep your account secure
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendTransactionalEmail({
    toEmail,
    toName: userName,
    subject,
    htmlContent,
  });
}

/**
 * Trip Itinerary Email Dispatcher
 */
export async function sendTripItineraryEmail({ toEmail, recipientName, trip, shareUrl, pdfAttachment }) {
  const origin = trip.form?.origin || trip.plan?.route?.[0]?.from || 'Origin';
  const destination = trip.form?.destination || trip.plan?.route?.[trip.plan?.route?.length - 1]?.to || 'Destination';
  const days = trip.form?.days || trip.plan?.dayPlan?.length || 3;
  const travellers = trip.form?.travellers || 1;
  const totalCost = trip.plan?.totalCost;
  const perPersonCost = trip.plan?.perPersonCost;

  const subject = `Your Trip Itinerary: ${destination} (${days} Days) • Safar ✈️`;

  // Build Day Plan HTML
  const dayPlanHtml = (trip.plan?.dayPlan || [])
    .slice(0, 7) // Show up to 7 days cleanly
    .map(
      (d) => `
      <div style="margin-bottom: 16px; padding: 14px; background-color: #f8f9fa; border-radius: 12px; border-left: 4px solid #ff6b35;">
        <strong style="font-size: 15px; color: #1d1d1f; display: block; margin-bottom: 4px;">Day ${d.day}: ${d.title}</strong>
        <p style="font-size: 13px; line-height: 1.5; color: #48484a; margin: 0;">${d.details}</p>
      </div>`
    )
    .join('');

  // Build Tips HTML
  const tipsHtml = (trip.plan?.tips || [])
    .slice(0, 4)
    .map((t) => `<li style="margin-bottom: 6px; font-size: 13px; color: #48484a;">${t}</li>`)
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trip Itinerary: ${destination}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 25px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8e8ed;">
          
          <!-- Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%); padding: 30px; color: #ffffff;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #ff6b35; font-weight: 700; margin-bottom: 8px;">
                Safar Travel Itinerary
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                ${origin} → ${destination}
              </h1>
              <p style="margin: 0; font-size: 14px; color: #a1a1a6;">
                📅 ${days} Days &nbsp;|&nbsp; 👥 ${travellers} Traveller(s) &nbsp;|&nbsp; 🎒 ${trip.form?.tripType || 'Vacation'}
              </p>
            </td>
          </tr>

          <!-- Summary & Highlights -->
          <tr>
            <td style="padding: 30px;">
              ${
                trip.plan?.summary
                  ? `<p style="font-size: 14px; line-height: 1.6; color: #48484a; margin: 0 0 24px 0; padding: 12px 16px; background-color: #fff9f5; border-radius: 12px; border: 1px solid #ffe8dc;">
                      "${trip.plan.summary}"
                    </p>`
                  : ''
              }

              <!-- Estimated Budget Grid -->
              ${
                totalCost
                  ? `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #fafafc; border-radius: 14px; padding: 16px; border: 1px solid #ededf2;">
                      <tr>
                        <td style="padding: 6px 12px;">
                          <span style="font-size: 12px; color: #86868b; text-transform: uppercase; font-weight: 600;">Estimated Total Budget</span>
                          <div style="font-size: 20px; font-weight: 800; color: #1d1d1f; margin-top: 4px;">
                            ₹${totalCost.min.toLocaleString('en-IN')} - ₹${totalCost.max.toLocaleString('en-IN')}
                          </div>
                        </td>
                        ${
                          perPersonCost
                            ? `<td style="padding: 6px 12px; border-left: 1px solid #e8e8ed;">
                                <span style="font-size: 12px; color: #86868b; text-transform: uppercase; font-weight: 600;">Per Person Cost</span>
                                <div style="font-size: 20px; font-weight: 800; color: #ff6b35; margin-top: 4px;">
                                  ₹${perPersonCost.min.toLocaleString('en-IN')} - ₹${perPersonCost.max.toLocaleString('en-IN')}
                                </div>
                              </td>`
                            : ''
                        }
                      </tr>
                    </table>`
                  : ''
              }

              <!-- Day-by-Day Section -->
              <h3 style="font-size: 17px; font-weight: 700; margin: 0 0 14px 0; color: #1d1d1f;">
                Day-by-Day Travel Plan
              </h3>
              ${dayPlanHtml}

              <!-- Travel Tips Section -->
              ${
                tipsHtml
                  ? `<div style="margin-top: 24px;">
                      <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 10px 0; color: #1d1d1f;">
                        💡 Pro Tips for ${destination}
                      </h3>
                      <ul style="padding-left: 18px; margin: 0;">
                        ${tipsHtml}
                      </ul>
                    </div>`
                  : ''
              }

              <!-- Attachment Notice if PDF is included -->
              ${
                pdfAttachment
                  ? `<div style="margin-bottom: 24px; padding: 14px 18px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; display: flex; align-items: center;">
                      <span style="font-size: 14px; color: #166534; line-height: 1.5;">
                        📄 <strong>PDF Itinerary Attached:</strong> We've attached your complete branded Safar PDF itinerary to this email for offline reading and printing.
                      </span>
                    </div>`
                  : ''
              }

              <!-- Call to Action -->
              ${
                shareUrl
                  ? `<div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f2f2f5;">
                      <a href="${shareUrl}" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 980px; box-shadow: 0 4px 14px rgba(255, 107, 53, 0.35);">
                        Open Live Itinerary on Safar →
                      </a>
                    </div>`
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #fafafc; border-top: 1px solid #ededf2; text-align: center; color: #86868b; font-size: 12px;">
              Sent via <strong>Safar</strong> • Your Smart Indian Travel Planner
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendTransactionalEmail({
    toEmail,
    toName: recipientName,
    subject,
    htmlContent,
    attachments: pdfAttachment ? [pdfAttachment] : [],
  });
}
