import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getDb, runTransaction, appendAuditLog, createId } from '../services/db.ts';
import {
  extractUser,
  sanitizeString,
  type AuthenticatedRequest,
} from '../services/cryptoAuth.ts';
import {
  getDemoSystemStatus,
  isLiveRazorpayConfigured,
  createSimulatedEmail,
} from '../services/demoConfig.ts';

export const aiAndPaymentRouter = Router();

// Section 21: Gemini AI Hospital Assistant (Server-Side Only, Automatic Demo Fallback)
aiAndPaymentRouter.post('/ai/assistant', async (req, res) => {
  try {
    const userMessage = sanitizeString(req.body.message, 600);
    if (!userMessage) {
      return res.status(400).json({ error: 'Please enter a question for the Gokul Hospital Assistant.' });
    }

    const db = getDb();
    const deptNames = db.departments
      .filter((d) => d.isActive)
      .map((d) => `${d.name} (${d.floorLocation})`)
      .join(', ');
    const doctorList = db.doctors
      .filter((d) => d.isAvailable)
      .map((d) => `${d.name} - ${d.specialization} (${d.departmentName}, Fee: ₹${d.consultationFee})`)
      .join('; ');

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        reply:
          `Welcome to the **Gokul Hospital Information Assistant (Demo Mode)**.\n\n` +
          `- **Medical Departments (${db.departments.length}):** ${deptNames}\n` +
          `- **Available Specialists (${db.doctors.length}):** ${doctorList}\n` +
          `- **OPD Timings:** ${db.websiteSettings.opdHours}\n` +
          `- **24/7 Emergency Helpline:** ${db.websiteSettings.emergencyPhone}\n\n` +
          `To book an appointment, open the **Book Appointment** page, choose your department and doctor, select an open time slot, and test with either **Pay at Hospital Counter** or **Demo Payment Mode**.\n\n` +
          `*Medical Disclaimer: This assistant provides hospital navigation information only and does not diagnose conditions, prescribe medication, or replace a qualified doctor.*`,
        mode: 'fallback-directory',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the official AI Hospital Information & Navigation Assistant for GOKUL HOSPITAL in India.
Hospital Information Context:
- Hospital Name: ${db.websiteSettings.hospitalName}
- OPD Timings: ${db.websiteSettings.opdHours}
- Emergency Care: ${db.websiteSettings.emergencyHours} | Emergency Phone: ${db.websiteSettings.emergencyPhone}
- Active Departments: ${deptNames}
- Available Doctors: ${doctorList}

STRICT MEDICAL SAFETY RULES:
1. NEVER diagnose diseases, interpret medical symptoms definitively, or prescribe any medication or dosage.
2. NEVER pretend to replace a qualified physician or provide emergency medical treatment.
3. If the user describes any medical emergency (chest pain, difficulty breathing, severe bleeding, stroke symptoms, trauma, unconsciousness), immediately instruct them to call emergency services (${db.websiteSettings.emergencyPhone} or 108 in India) or proceed to the nearest 24/7 Emergency Department immediately.
4. Help users navigate Gokul Hospital departments, find the right specialist category, understand OPD hours, or learn how to book an appointment using the online booking form.
5. Keep responses concise, warm, well-structured, and always include a brief reminder that this assistant does not replace professional medical advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply:
        response.text ||
        'Please visit our Appointment page or contact the Gokul Hospital reception desk for assistance.',
      mode: 'gemini-live',
    });
  } catch (err) {
    console.error('Gemini AI Assistant notice (falling back to Demo Directory):', err);
    const db = getDb();
    return res.json({
      reply:
        `Welcome to the **Gokul Hospital Information Guide**.\n\n` +
        `- **OPD Hours:** ${db.websiteSettings.opdHours}\n` +
        `- **Emergency Helpline:** ${db.websiteSettings.emergencyPhone}\n` +
        `- **Online Booking:** Visit the **Book Appointment** page to check live doctor slots and book immediately.\n\n` +
        `*Medical Disclaimer: Non-diagnostic hospital navigation guide only.*`,
      mode: 'fallback-directory',
    });
  }
});

// Section 20: Payment Gateway & Demo Mode Status
aiAndPaymentRouter.get('/payments/config', (_req, res) => {
  const status = getDemoSystemStatus();
  const liveConfigured = isLiveRazorpayConfigured();

  return res.json({
    gatewayName: liveConfigured
      ? 'Razorpay Live Gateway (India INR)'
      : 'Razorpay Demo Payment Mode (Simulated Test Checkout)',
    currency: 'INR',
    isLiveGatewayConfigured: liveConfigured,
    demoPaymentEnabled: true,
    paymentMode: status.paymentMode,
    emailMode: status.emailMode,
    demoModeActive: status.demoModeActive,
    statusMessage: liveConfigured
      ? 'Live Razorpay gateway credentials are configured.'
      : 'DEMO PAYMENT MODE ACTIVE: You can test the complete appointment booking and checkout flow without entering any Razorpay API keys. Simulated transactions are clearly marked as Demo Test Only (not real payments). Real Razorpay integration remains ready whenever RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are added in the future.',
  });
});

// Demo Payment Mode & Sandbox Verification (Works without requiring API keys or login on confirmation page)
aiAndPaymentRouter.post('/payments/sandbox-order', async (req: AuthenticatedRequest, res) => {
  try {
    const currentUser = extractUser(req);
    const appointmentId = sanitizeString(req.body.appointmentId, 80);
    const paymentMethod = sanitizeString(req.body.paymentMethod, 50) || 'UPI / Demo Test Card';

    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required to simulate demo payment.' });
    }

    const liveRazorpay = isLiveRazorpayConfigured();
    const referencePrefix = liveRazorpay ? 'RZP-SANDBOX' : 'DEMO-SIM-RZP';

    const result = await runTransaction((db) => {
      const appt = db.appointments.find(
        (a) => a.id === appointmentId || a.appointmentNumber === appointmentId
      );
      if (!appt) return { error: 'Appointment not found.' } as const;

      appt.paymentStatus = 'PaidSandbox';
      appt.paymentReference = `${referencePrefix}-${Date.now().toString().slice(-6)} (${paymentMethod} · DEMO TEST ONLY)`;
      appt.updatedAt = new Date().toISOString();

      const simulatedEmail = createSimulatedEmail({
        to: appt.patientEmail,
        patientName: appt.patientName,
        subject: `[DEMO EMAIL MODE] Simulated Payment & Booking Notice — ${appt.appointmentNumber}`,
        bodyLines: [
          `Dear ${appt.patientName},`,
          ``,
          `Your outpatient appointment at GOKUL HOSPITAL (${appt.appointmentNumber}) has been updated with a DEMO PAYMENT SIMULATION receipt.`,
          `- Consulting Doctor: ${appt.doctorName} (${appt.departmentName})`,
          `- Date & Time Slot: ${appt.appointmentDate} at ${appt.timeSlot}`,
          `- Consultation Fee: ₹${appt.consultationFee} INR`,
          `- Payment Status: DEMO PAYMENT MODE (Simulated — ₹0 Real Money Charged)`,
          `- Simulated Reference: ${appt.paymentReference}`,
          ``,
          `IMPORTANT NOTICE: This is a simulated test payment in Demo Mode and NOT an actual financial transaction.`,
        ],
      });

      appt.demoEmailPreview = simulatedEmail;

      db.notifications.unshift({
        id: createId('notif'),
        userId: appt.patientId,
        title: `Demo Payment Simulated — ${appt.appointmentNumber}`,
        message: `Simulated test payment (${appt.paymentReference}) recorded for ₹${appt.consultationFee}. Note: Demo Mode simulation only, not a real payment. Simulated confirmation email generated for ${appt.patientEmail}.`,
        eventType: 'APPOINTMENT_CONFIRMATION',
        isRead: false,
        relatedId: appt.id,
        createdAt: appt.updatedAt,
      });

      appendAuditLog(db, {
        actorId: currentUser?.userId || appt.patientId,
        actorName: currentUser?.fullName || appt.patientName,
        actorRole: currentUser?.role || 'public',
        action: liveRazorpay ? 'RAZORPAY_SANDBOX_VERIFIED' : 'DEMO_PAYMENT_SIMULATED',
        entityType: 'appointment',
        entityId: appt.id,
        details: `Simulated demo payment ${appt.paymentReference} for ₹${appt.consultationFee} (No real charge).`,
      });

      return { appointment: appt, simulatedEmail } as const;
    });

    if ('error' in result) return res.status(404).json({ error: result.error });

    return res.json({
      message:
        'Demo Payment Simulation completed! Note: This is a simulated test transaction in Demo Mode and not a real monetary payment.',
      isDemoSimulation: !liveRazorpay,
      appointment: result.appointment,
      simulatedEmail: result.simulatedEmail,
    });
  } catch (err) {
    console.error('Demo payment simulation error:', err);
    return res.status(500).json({ error: 'Unable to process demo payment simulation.' });
  }
});
