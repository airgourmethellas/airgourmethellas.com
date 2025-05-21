import { Resend } from 'resend';
import { Order, User } from '@shared/schema';

// Initialize Resend client with fallback
let resend: Resend | null = null;

// Only create Resend instance if API key is available
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("Resend API configured successfully.");
} else {
  console.warn("Resend API key not found in environment variables. Email notifications will not work.");
}

interface EmailParams {
  to: string[];
  subject: string;
  text?: string;
  html: string;
}

/**
 * Send an email notification
 * @param params Email parameters including recipient, subject, and content
 * @returns boolean indicating success
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!resend) {
    console.log('Email notification would have been sent:', params);
    return false;
  }

  try {
    const { to, subject, html, text } = params;
    
    // Here we already checked resend is not null above
    const response = await resend!.emails.send({
      from: 'Air Gourmet Hellas <orders@airgourmet.gr>',
      to,
      subject,
      html,
      text,
    });

    if (response.error) {
      console.error('Email sending error:', response.error);
      return false;
    }
    
    console.log(`Email notification sent to ${to.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Resend email error:', error);
    return false;
  }
}

/**
 * Send a test email to verify the configuration
 * @param to Recipient email address
 * @returns boolean indicating success
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  if (!resend) {
    console.log('Test email would have been sent to:', to);
    return false;
  }
  
  try {
    // Here we already checked resend is not null above
    const response = await resend!.emails.send({
      from: 'Air Gourmet Hellas <orders@airgourmet.gr>',
      to: [to],
      subject: 'Test Email from Air Gourmet Hellas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0047AB;">Test Email Successful</h2>
          <p>This is a test email from Air Gourmet Hellas to verify that your email notification system is working correctly.</p>
          <p>If you're receiving this email, your notification system is properly configured.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message from Air Gourmet Hellas. Please do not reply to this email.</p>
        </div>
      `,
    });

    if (response.error) {
      console.error('Test email error:', response.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Resend test email error:', error);
    return false;
  }
}