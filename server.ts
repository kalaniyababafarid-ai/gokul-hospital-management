import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/services/db.ts';
import { authRouter } from './server/routes/authRoutes.ts';
import { publicRouter } from './server/routes/publicRoutes.ts';
import { appointmentRouter } from './server/routes/appointmentRoutes.ts';
import { clinicalRouter } from './server/routes/clinicalRoutes.ts';
import { adminRouter } from './server/routes/adminRoutes.ts';
import { aiAndPaymentRouter } from './server/routes/aiAndPaymentRoutes.ts';

export async function createHospitalApp() {
  const app = express();

  // Initialize persistent database on startup
  getDb();

  app.use(express.json({ limit: '2mb' }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const db = getDb();
    res.json({
      status: 'ok',
      hospital: db.websiteSettings.hospitalName,
      departments: db.departments.length,
      doctors: db.doctors.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use('/api/auth', authRouter);
  app.use('/api/public', publicRouter);
  app.use('/api', publicRouter);
  app.use('/api/appointments', appointmentRouter);
  app.use('/api/clinical', clinicalRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', aiAndPaymentRouter);

  // API 404 handler
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  return app;
}

async function startServer() {
  const app = await createHospitalApp();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gokul Hospital Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VITEST !== 'true' && process.env.RUN_API_TESTS !== 'true') {
  startServer();
}
