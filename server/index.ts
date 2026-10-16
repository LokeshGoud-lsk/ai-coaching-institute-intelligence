import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';
import assessmentRoutes from './routes/assessments';
import earlyWarningRoutes from './routes/earlyWarning';
import feeRoutes from './routes/fees';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import batchRoutes from './routes/batches';
import facultyRoutes from './routes/faculty';
import settingsRoutes from './routes/settings';
import { checkDatabaseConnection, isDatabaseConnected } from './db';

export const app = express();

// Security and CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Coaching Institute Intelligence API',
    version: '1.0.0',
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message,
      provider: 'postgresql',
    },
    env: process.env.NODE_ENV || 'development',
  });
});

// REST API v1 routing
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/early-warning', earlyWarningRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    status,
  });
});

// Start listener when executed directly (not in Vercel serverless or production build)
const PORT = process.env.PORT || 5005;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`EduTrack API Server running on port ${PORT}`);
    console.log(`Base URL: http://localhost:${PORT}/api/v1`);
    const dbStatus = await checkDatabaseConnection();
    console.log(`[Database Status]: ${dbStatus.message}`);
  });
}

export default app;
