import crypto from 'crypto';
import type { SimulatedEmailPreview } from '../../src/types/hospital.ts';

// Safe development/demo session secret generator when SESSION_SECRET / SESSION__SECRET is not configured
const ENV_SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() ||
  process.env.SESSION__SECRET?.trim() ||
  '';

const AUTO_DEV_SESSION_SECRET = crypto
  .createHash('sha256')
  .update('gokul-hospital-demo-mode-development-secret-key-india')
  .digest('hex');

export function getSessionSecret(): string {
  return ENV_SESSION_SECRET || AUTO_DEV_SESSION_SECRET;
}

export function isLiveRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';
  return Boolean(keyId && keySecret);
}

export function isLiveSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim() || '';
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = process.env.SMTP_PASS?.trim() || '';
  return Boolean(host && user && pass);
}

export function getDemoSystemStatus() {
  const liveRazorpay = isLiveRazorpayConfigured();
  const liveSmtp = isLiveSmtpConfigured();
  const customSessionSecret = Boolean(ENV_SESSION_SECRET);

  return {
    demoModeActive: !liveRazorpay || !liveSmtp || !customSessionSecret,
    sessionAuthMode: customSessionSecret ? 'CUSTOM_SECRET' : 'AUTO_DEV_SECRET',
    paymentMode: liveRazorpay ? 'LIVE_RAZORPAY' : 'DEMO_PAYMENT_MODE',
    emailMode: liveSmtp ? 'LIVE_SMTP' : 'DEMO_EMAIL_MODE',
    razorpayKeyIdPublic: liveRazorpay ? process.env.RAZORPAY_KEY_ID : 'rzp_test_DEMO_SIMULATION_MODE',
  };
}

export function createSimulatedEmail(params: {
  to: string;
  patientName: string;
  subject: string;
  bodyLines: string[];
}): SimulatedEmailPreview {
  const liveSmtp = isLiveSmtpConfigured();
  return {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    to: params.to,
    from: 'Gokul Hospital OPD Desk <notifications@gokulhospital.in>',
    subject: params.subject,
    body: params.bodyLines.join('\n'),
    sentAt: new Date().toISOString(),
    mode: liveSmtp ? 'LIVE_SMTP' : 'DEMO_EMAIL_MODE',
    disclaimer: liveSmtp
      ? 'Dispatched via configured SMTP server.'
      : 'DEMO EMAIL MODE: Simulated confirmation email displayed in-app (no SMTP or Gmail credentials required).',
  };
}
