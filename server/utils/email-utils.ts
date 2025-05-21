import { resendClient } from "../services/email-service";

/**
 * Send an email using the configured email service
 * 
 * @param options Email options including subject, html content, recipient, and sender
 * @returns Promise resolving to true if the email was sent successfully, false otherwise
 */
export async function sendEmail(options: {
  subject: string;
  html: string;
  to: string[] | string;
  from: string;
}): Promise<boolean> {
  try {
    // Use the Resend email service
    await resendClient.emails.send({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}