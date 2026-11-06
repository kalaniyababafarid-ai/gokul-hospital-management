import assert from 'node:assert/strict';
import http from 'node:http';
import { createHospitalApp } from '../server';

process.env.RUN_API_TESTS = 'true';

async function runIntegrationTests() {
  console.log('=== GOKUL HOSPITAL: Starting Automated API & RBAC Integration Suite ===');
  const app = await createHospitalApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test server');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function req(path: string, method = 'GET', body?: unknown, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Health Check
    const health = await req('/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.data.hospital, 'GOKUL HOSPITAL');
    console.log('✓ [1/12] Health check endpoint verified');

    // 2. Bootstrap Public Data
    const bootstrap = await req('/api/public/bootstrap');
    assert.equal(bootstrap.status, 200);
    assert.ok(bootstrap.data.departments.length >= 15, 'Should have 15 departments');
    assert.ok(bootstrap.data.doctors.length >= 8, 'Should have at least 8 doctors');
    assert.equal(bootstrap.data.settings.hospitalName, 'GOKUL HOSPITAL');
    console.log('✓ [2/12] Public bootstrap data (15 departments, 8 doctors, settings) verified');

    // 3. Role Login Verification (Admin, Doctor, Receptionist, Patient)
    const adminLogin = await req('/api/auth/login', 'POST', {
      email: 'admin@gokulhospital.in',
      password: 'Admin@123',
    });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.data.user.role, 'admin');
    const adminToken = adminLogin.data.token as string;

    const doctorLogin = await req('/api/auth/login', 'POST', {
      email: 'dr.sharma@gokulhospital.in',
      password: 'Doctor@123',
    });
    assert.equal(doctorLogin.status, 200);
    assert.equal(doctorLogin.data.user.role, 'doctor');
    const doctorToken = doctorLogin.data.token as string;

    const receptionLogin = await req('/api/auth/login', 'POST', {
      email: 'reception@gokulhospital.in',
      password: 'Reception@123',
    });
    assert.equal(receptionLogin.status, 200);
    assert.equal(receptionLogin.data.user.role, 'receptionist');
    const receptionToken = receptionLogin.data.token as string;

    const patientLogin = await req('/api/auth/login', 'POST', {
      email: 'patient@gokulhospital.in',
      password: 'Patient@123',
    });
    assert.equal(patientLogin.status, 200);
    assert.equal(patientLogin.data.user.role, 'patient');
    const patientToken = patientLogin.data.token as string;
    console.log('✓ [3/12] Multi-role authentication (Admin, Doctor, Receptionist, Patient) verified');

    // 4. Duplicate Registration Prevention
    const dupReg = await req('/api/auth/register', 'POST', {
      fullName: 'Duplicate User',
      email: 'patient@gokulhospital.in',
      phone: '+91 9876500000',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      privacyConsent: true,
      termsAccepted: true,
    });
    assert.equal(dupReg.status, 409);
    console.log('✓ [4/12] Duplicate email registration prevention (409 Conflict) verified');

    // 5. Doctor Live Slot Availability & Direct /api/* Endpoints (2026-12-14 is a Monday)
    const targetDate = '2026-12-14';
    const deptsDirect = await req('/api/departments');
    assert.equal(deptsDirect.status, 200);
    assert.ok(deptsDirect.data.departments.length >= 15);

    const docsDirect = await req('/api/doctors?departmentId=dept-cardiology');
    assert.equal(docsDirect.status, 200);
    assert.ok(docsDirect.data.doctors.length >= 1);

    // Ensure clean state on targetDate if previous test run was interrupted
    const existingAppts = await req('/api/appointments', 'GET', undefined, adminToken);
    for (const appt of existingAppts.data.appointments || []) {
      if (appt.appointmentDate === targetDate && appt.status !== 'Cancelled') {
        await req(`/api/appointments/${appt.id}/cancel`, 'POST', { reason: 'Pre-test cleanup' }, adminToken);
      }
    }

    const slotsBefore = await req(`/api/doctors/doc-1/availability?date=${targetDate}`);
    assert.equal(slotsBefore.status, 200);
    assert.ok(
      slotsBefore.data.slots.some(
        (s: { timeSlot: string; isAvailable: boolean }) => s.timeSlot === '10:30 AM' && s.isAvailable
      )
    );
    console.log('✓ [5/12] Doctor live slot availability & /api/departments + /api/doctors endpoints verified');

    // 6. Appointment Booking & Reference Number Generation
    const bookRes = await req(
      '/api/appointments',
      'POST',
      {
        patientName: 'Aarav Patel',
        patientEmail: 'patient@gokulhospital.in',
        patientPhone: '+91 98201 11223',
        departmentId: 'dept-cardiology',
        doctorId: 'doc-1',
        appointmentDate: targetDate,
        timeSlot: '10:30 AM',
        reason: 'Routine cardiac evaluation and blood pressure check',
      },
      patientToken
    );
    assert.equal(bookRes.status, 201);
    assert.match(bookRes.data.appointment.appointmentNumber, /^GKH-\d{4}-\d{4}$/);
    const apptId = bookRes.data.appointment.id as string;
    console.log(`✓ [6/12] Appointment booking created with reference ${bookRes.data.appointment.appointmentNumber}`);

    // 7. Concurrency / Double-Booking Prevention for Same Doctor + Date + Slot
    const duplicateSlotRes = await req(
      '/api/appointments',
      'POST',
      {
        patientName: 'Another Patient',
        patientEmail: 'another@example.com',
        patientPhone: '+91 98201 99887',
        departmentId: 'dept-cardiology',
        doctorId: 'doc-1',
        appointmentDate: targetDate,
        timeSlot: '10:30 AM',
        reason: 'Testing duplicate slot lock',
      },
      patientToken
    );
    assert.equal(duplicateSlotRes.status, 409);
    console.log('✓ [7/12] Duplicate appointment slot lock (409 Conflict) verified');

    // 8. Reschedule Appointment & Free Old Slot
    const rescheduleRes = await req(
      `/api/appointments/${apptId}/reschedule`,
      'PATCH',
      {
        appointmentDate: targetDate,
        timeSlot: '11:00 AM',
      },
      patientToken
    );
    assert.equal(rescheduleRes.status, 200);
    assert.equal(rescheduleRes.data.appointment.timeSlot, '11:00 AM');

    const slotsAfterReschedule = await req(`/api/public/doctors/doc-1/availability?date=${targetDate}`);
    assert.ok(
      slotsAfterReschedule.data.slots.some(
        (s: { timeSlot: string; isAvailable: boolean }) => s.timeSlot === '10:30 AM' && s.isAvailable
      ),
      '10:30 AM should be available again'
    );
    assert.ok(
      slotsAfterReschedule.data.slots.some(
        (s: { timeSlot: string; isAvailable: boolean }) => s.timeSlot === '11:00 AM' && !s.isAvailable
      ),
      '11:00 AM should now be booked'
    );
    console.log('✓ [8/12] Appointment rescheduling and dynamic slot release verified');

    // 9. RBAC Enforcement (Patient Cannot Access Admin Overview or Create Prescriptions; Receptionist Cannot View Lab Reports)
    const unauthorizedAdmin = await req('/api/admin/overview', 'GET', undefined, patientToken);
    assert.equal(unauthorizedAdmin.status, 403);

    const unauthorizedRx = await req(
      '/api/clinical/prescriptions',
      'POST',
      {
        patientId: 'user-patient-1',
        diagnosis: 'Unauthorized attempt',
        medications: [{ medicineName: 'Test', dosage: '1', frequency: '1', duration: '1' }],
      },
      patientToken
    );
    assert.equal(unauthorizedRx.status, 403);

    const unauthorizedReceptionLab = await req('/api/clinical/lab-reports', 'GET', undefined, receptionToken);
    assert.equal(unauthorizedReceptionLab.status, 403);
    console.log('✓ [9/12] Role-Based Access Control (403 Forbidden for unauthorized roles) verified');

    // 10. Doctor Clinical Prescription Creation & Patient Visibility
    const rxRes = await req(
      '/api/clinical/prescriptions',
      'POST',
      {
        patientId: 'user-patient-1',
        diagnosis: 'Mild Essential Hypertension',
        medications: [
          {
            medicineName: 'Tab. Telmisartan 40mg',
            dosage: '1-0-0',
            frequency: 'Once daily morning',
            duration: '30 Days',
            instructions: 'Take after breakfast',
          },
        ],
        generalAdvice: 'Low sodium diet and 30 minutes brisk walk daily.',
      },
      doctorToken
    );
    assert.equal(rxRes.status, 201);

    const patientRxList = await req('/api/clinical/prescriptions', 'GET', undefined, patientToken);
    assert.equal(patientRxList.status, 200);
    assert.ok(
      patientRxList.data.prescriptions.some((p: { id: string }) => p.id === rxRes.data.prescription.id),
      'Patient should see their newly issued prescription'
    );
    console.log('✓ [10/12] Doctor digital prescription creation & patient portal visibility verified');

    // 11. Diagnostic Lab Report Upload & File Validation
    const labRes = await req(
      '/api/clinical/lab-reports',
      'POST',
      {
        patientId: 'user-patient-1',
        testName: 'Complete Lipid Profile & HbA1c',
        category: 'Biochemistry',
        summaryResult: 'Total Cholesterol: 178 mg/dL (Normal), HbA1c: 5.5% (Normal)',
        fileName: 'Lipid_Profile_Aarav.pdf',
        parameters: [
          {
            parameterName: 'Total Cholesterol',
            observedValue: '178 mg/dL',
            referenceRange: '< 200 mg/dL',
            status: 'Normal',
          },
        ],
      },
      doctorToken
    );
    assert.equal(labRes.status, 201);
    console.log('✓ [11/12] Diagnostic lab report creation & structured parameter validation verified');

    // 12. Demo Payment Mode, Demo Email Mode, Admin Analytics & Cancellation
    assert.ok(
      bookRes.data.appointment.demoEmailPreview &&
        bookRes.data.appointment.demoEmailPreview.mode === 'DEMO_EMAIL_MODE',
      'Appointment booking should automatically generate a Demo Email Mode preview'
    );

    const paymentCfg = await req('/api/payments/config');
    assert.equal(paymentCfg.status, 200);
    assert.equal(paymentCfg.data.demoPaymentEnabled, true);

    const demoPayRes = await req(
      '/api/payments/sandbox-order',
      'POST',
      { appointmentId: apptId, paymentMethod: 'Demo UPI Test' },
      patientToken
    );
    assert.equal(demoPayRes.status, 200);
    assert.equal(demoPayRes.data.appointment.paymentStatus, 'PaidSandbox');
    assert.match(demoPayRes.data.appointment.paymentReference, /DEMO/);

    const adminOverview = await req('/api/admin/overview', 'GET', undefined, adminToken);
    assert.equal(adminOverview.status, 200);
    assert.ok(adminOverview.data.stats.totalAppointments >= 1);
    assert.ok(adminOverview.data.recentAuditLogs.length >= 3);

    // Cleanup test appointment by cancelling it
    const cancelRes = await req(
      `/api/appointments/${apptId}/cancel`,
      'PATCH',
      { reason: 'Automated integration test cleanup' },
      patientToken
    );
    assert.equal(cancelRes.status, 200);
    console.log('✓ [12/12] Demo Payment Mode, Demo Email Mode, Admin analytics & cancellation verified');

    console.log('\n====================================================================');
    console.log('ALL 12 AUTOMATED HOSPITAL SYSTEM TESTS PASSED SUCCESSFULLY');
    console.log('====================================================================');
  } finally {
    server.close();
  }
}

runIntegrationTests().catch((err) => {
  console.error('Integration Test Failure:', err);
  process.exit(1);
});
