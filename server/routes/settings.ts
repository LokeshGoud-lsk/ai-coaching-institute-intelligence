import { Router, Request, Response } from 'express';
import { store } from '../db';

const router = Router();

// GET /api/v1/settings
router.get('/', (req: Request, res: Response) => {
  return res.json({
    institute: store.institute,
    auditLogsCount: store.auditLogs.length,
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_google_gemini_api_key')),
    databaseProvider: process.env.DATABASE_URL ? 'Supabase PostgreSQL (Prisma Connected)' : 'In-Memory / Seed Store Active (Zero-downtime)',
  });
});

// PUT /api/v1/settings - Update institute policies and thresholds
router.put('/', (req: Request, res: Response) => {
  const { name, minAttendance, scoreDeclinePct, contactEmail, contactPhone, address } = req.body;

  if (name) store.institute.name = name;
  if (minAttendance !== undefined) store.institute.minAttendance = Number(minAttendance);
  if (scoreDeclinePct !== undefined) store.institute.scoreDeclinePct = Number(scoreDeclinePct);
  if (contactEmail) store.institute.contactEmail = contactEmail;
  if (contactPhone) store.institute.contactPhone = contactPhone;
  if (address) store.institute.address = address;

  store.logAudit('INSTITUTE_SETTINGS_UPDATED', 'SETTINGS', {
    minAttendance: store.institute.minAttendance,
    scoreDeclinePct: store.institute.scoreDeclinePct,
  });

  return res.json({
    message: 'Institute settings updated successfully',
    institute: store.institute,
  });
});

export default router;
