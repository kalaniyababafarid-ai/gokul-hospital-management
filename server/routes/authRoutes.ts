import { Router } from 'express';
import crypto from 'crypto';
import {
  getDb,
  runTransaction,
  createId,
  appendAuditLog,
  sanitizeUser,
} from '../services/db.ts';
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  sanitizeString,
  type AuthenticatedRequest,
} from '../services/cryptoAuth.ts';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const fullName = sanitizeString(req.body.fullName, 120);
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    const phone = sanitizeString(req.body.phone, 30);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const confirmPassword = typeof req.body.confirmPassword === 'string' ? req.body.confirmPassword : '';
    const dateOfBirth = sanitizeString(req.body.dateOfBirth, 20);
    const gender = sanitizeString(req.body.gender, 30);
    const address = sanitizeString(req.body.address, 300);
    const privacyConsent = Boolean(req.body.privacyConsent);
    const termsAccepted = Boolean(req.body.termsAccepted);

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Full name, email, mobile number, and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }
    if (!privacyConsent || !termsAccepted) {
      return res.status(400).json({
        error: 'You must accept the Privacy Policy and Terms & Conditions to register.',
      });
    }

    const result = await runTransaction((db) => {
      const existingUser = db.users.find((u) => u.email.toLowerCase() === email);
      if (existingUser) {
        return { error: 'An account with this email address already exists.' } as const;
      }

      const now = new Date().toISOString();
      const newUser = {
        id: createId('user-pat'),
        fullName,
        email,
        phone,
        role: 'patient' as const, // Public registration NEVER creates admin accounts
        isActive: true,
        emailVerified: true,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        address: address || undefined,
        privacyConsent: true,
        termsAccepted: true,
        allowDataSharingWithDoctors: true,
        passwordHash: hashPassword(password),
        createdAt: now,
        updatedAt: now,
      };

      db.users.push(newUser);

      db.notifications.unshift({
        id: createId('notif'),
        userId: newUser.id,
        title: 'Welcome to Gokul Hospital Patient Portal',
        message: `Hello ${newUser.fullName}, your patient account has been registered. You can now book appointments and view your clinical records securely.`,
        eventType: 'PATIENT_REGISTRATION',
        isRead: false,
        createdAt: now,
      });

      appendAuditLog(db, {
        actorId: newUser.id,
        actorName: newUser.fullName,
        actorRole: 'patient',
        action: 'PATIENT_REGISTERED',
        entityType: 'user',
        entityId: newUser.id,
        details: `New patient account registered (${newUser.email}).`,
      });

      return { user: sanitizeUser(newUser) } as const;
    });

    if ('error' in result) {
      return res.status(409).json({ error: result.error });
    }

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      fullName: result.user.fullName,
    });

    return res.status(201).json({ token, user: result.user });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Unable to complete registration at this time.' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'This account has been deactivated by hospital administration. Please contact the helpdesk.',
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      doctorId: user.doctorId,
    });

    await runTransaction((txDb) => {
      appendAuditLog(txDb, {
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'USER_LOGIN',
        entityType: 'user',
        entityId: user.id,
        details: `${user.role.toUpperCase()} login successful (${user.email}).`,
      });
    });

    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Unable to sign in at this time.' });
  }
});

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user?.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'User account not found or inactive.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const result = await runTransaction((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) return null;

      if (req.body.fullName) user.fullName = sanitizeString(req.body.fullName, 120);
      if (req.body.phone) user.phone = sanitizeString(req.body.phone, 30);
      if (req.body.dateOfBirth !== undefined) user.dateOfBirth = sanitizeString(req.body.dateOfBirth, 20);
      if (req.body.gender !== undefined) user.gender = sanitizeString(req.body.gender, 30);
      if (req.body.address !== undefined) user.address = sanitizeString(req.body.address, 300);
      if (req.body.bloodGroup !== undefined) user.bloodGroup = sanitizeString(req.body.bloodGroup, 15);
      if (req.body.emergencyContact !== undefined) {
        user.emergencyContact = sanitizeString(req.body.emergencyContact, 100);
      }
      if (req.body.allergies !== undefined) user.allergies = sanitizeString(req.body.allergies, 300);
      if (req.body.chronicConditions !== undefined) {
        user.chronicConditions = sanitizeString(req.body.chronicConditions, 300);
      }
      if (typeof req.body.allowDataSharingWithDoctors === 'boolean') {
        user.allowDataSharingWithDoctors = req.body.allowDataSharingWithDoctors;
      }
      user.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'PROFILE_UPDATED',
        entityType: 'user',
        entityId: user.id,
        details: 'Updated personal profile and privacy preferences.',
      });

      return sanitizeUser(user);
    });

    if (!result) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.json({ user: result });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

authRouter.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const updated = await runTransaction((db) => {
      const user = db.users.find((u) => u.id === req.user!.userId);
      if (!user) return { error: 'Account not found.' };
      if (!verifyPassword(currentPassword, user.passwordHash)) {
        return { error: 'Current password is incorrect.' };
      }
      user.passwordHash = hashPassword(newPassword);
      user.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'PASSWORD_CHANGED',
        entityType: 'user',
        entityId: user.id,
        details: 'User changed account password.',
      });
      return { success: true };
    });

    if ('error' in updated) {
      return res.status(400).json({ error: updated.error });
    }
    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ error: 'Unable to change password.' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Please provide your registered email address.' });
    }

    const result = await runTransaction((db) => {
      const user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        return { found: false };
      }
      const resetToken = `GKH-RST-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      db.passwordResetTokens.push({
        token: resetToken,
        userId: user.id,
        email: user.email,
        expiresAt: Date.now() + 30 * 60 * 1000,
        used: false,
      });

      appendAuditLog(db, {
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'user',
        entityId: user.id,
        details: `Password reset token generated for ${user.email}.`,
      });

      return { found: true, resetToken };
    });

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    return res.json({
      message:
        'Password reset code generated. Note: External SMTP email delivery is not configured in this environment, so your verification token is displayed below for immediate password reset.',
      smtpConfigured,
      resetToken: result.found ? result.resetToken : undefined,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const token = sanitizeString(req.body.token, 64);
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const outcome = await runTransaction((db) => {
      const tokenEntry = db.passwordResetTokens.find(
        (t) => t.token === token && !t.used && t.expiresAt > Date.now()
      );
      if (!tokenEntry) {
        return { error: 'Invalid or expired password reset token.' };
      }
      const user = db.users.find((u) => u.id === tokenEntry.userId);
      if (!user) {
        return { error: 'Associated user account not found.' };
      }

      tokenEntry.used = true;
      user.passwordHash = hashPassword(newPassword);
      user.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'user',
        entityId: user.id,
        details: `Password reset completed using token for ${user.email}.`,
      });

      return { success: true };
    });

    if ('error' in outcome) {
      return res.status(400).json({ error: outcome.error });
    }

    return res.json({ message: 'Your password has been reset. You may now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Unable to reset password.' });
  }
});
