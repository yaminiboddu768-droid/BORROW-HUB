import { Resend } from 'resend';
import axios from 'axios';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// MSG91 Configuration
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'BRRHUB';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export interface NotificationPayload {
  toEmail?: string;
  toPhone?: string;
  subject?: string;
  message: string;
  html?: string;
}

export async function sendNotification(payload: NotificationPayload) {
  const results = {
    email: false,
    sms: false,
    errors: [] as string[],
  };

  // 1. Send Email via Resend
  if (payload.toEmail && resend) {
    try {
      const data = await resend.emails.send({
        from: 'Borrow Hub <noreply@borrowhub.com>',
        to: [payload.toEmail],
        subject: payload.subject || 'Notification from Borrow Hub',
        html: payload.html || `<p>${payload.message}</p>`,
      });
      if (data.error) {
        results.errors.push(`Email error: ${data.error.message}`);
      } else {
        results.email = true;
      }
    } catch (err: any) {
      console.error('Failed to send email:', err);
      results.errors.push(`Email Exception: ${err.message}`);
    }
  } else if (payload.toEmail && !resend) {
    results.errors.push('RESEND_API_KEY is not configured');
    console.warn(`[MOCK EMAIL] To: ${payload.toEmail}, Subject: ${payload.subject}`);
  }

  // 2. Send SMS via MSG91
  if (payload.toPhone && MSG91_AUTH_KEY) {
    try {
       // MSG91 Send SMS API
       const response = await axios.post(
         'https://control.msg91.com/api/v5/flow/',
         {
           template_id: MSG91_TEMPLATE_ID,
           short_url: "0",
           recipients: [
             {
               mobiles: payload.toPhone.replace(/\D/g, ''), // Keep only digits
               var1: payload.message.substring(0, 30), // Example variable
             }
           ]
         },
         {
           headers: {
             'authkey': MSG91_AUTH_KEY,
             'content-type': 'application/json'
           }
         }
       );
       
       if (response.data.type === 'success') {
         results.sms = true;
       } else {
         results.errors.push(`SMS API Error: ${JSON.stringify(response.data)}`);
       }
    } catch (err: any) {
      console.error('Failed to send SMS via MSG91:', err);
      results.errors.push(`SMS Exception: ${err.message}`);
    }
  } else if (payload.toPhone && !MSG91_AUTH_KEY) {
    results.errors.push('MSG91_AUTH_KEY is not configured');
    console.warn(`[MOCK SMS] To: ${payload.toPhone}, Message: ${payload.message}`);
  }

  return results;
}
