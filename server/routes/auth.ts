import { Router, Request, Response } from 'express';
import {
  store,
  prisma,
  isDatabaseConnected,
  checkDatabaseConnection,
  setDatabaseUrl,
} from '../db';
import { UserProfile } from '../../src/types';

const router = Router();

// GET /api/v1/auth/database-status - Real-time database health and metadata
router.get('/database-status', async (req: Request, res: Response) => {
  const dbHealth = await checkDatabaseConnection();

  let dbUserCount = 0;
  let dbInstituteCount = 0;
  let latencyMs = 0;

  if (dbHealth.connected) {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - start;
      dbUserCount = await prisma.userProfile.count();
      dbInstituteCount = await prisma.institute.count();
    } catch (_) {}
  }

  return res.json({
    connected: dbHealth.connected,
    message: dbHealth.message,
    provider: dbHealth.connected ? 'PostgreSQL (Prisma ORM)' : 'Seeded Store (Offline / Standby Mode)',
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    totalUsers: dbHealth.connected ? dbUserCount : store.users.length,
    institutesCount: dbHealth.connected ? dbInstituteCount : 1,
    latencyMs: dbHealth.connected ? latencyMs : 1,
    activeInstituteName: store.institute.name,
    directUrlConfigured: Boolean(process.env.DIRECT_URL),
  });
});

// POST /api/v1/auth/connect-database - Connect to PostgreSQL database dynamically
router.post('/connect-database', async (req: Request, res: Response) => {
  const { databaseUrl } = req.body;

  if (!databaseUrl || typeof databaseUrl !== 'string') {
    return res.status(400).json({ error: 'Valid database connection string (DATABASE_URL) is required.' });
  }

  try {
    const status = await setDatabaseUrl(databaseUrl);
    return res.json({
      success: status.connected,
      message: status.message,
      connected: status.connected,
      provider: status.connected ? 'PostgreSQL (Prisma ORM)' : 'Seeded Store (Standby)',
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to connect to database.',
    });
  }
});

// POST /api/v1/auth/login - Authenticate user against Database / Store with password verification
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Official institutional email is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try querying PostgreSQL via Prisma if connected
  let dbUser: any = null;
  if (isDatabaseConnected) {
    try {
      dbUser = await prisma.userProfile.findUnique({
        where: { email: normalizedEmail },
        include: {
          memberships: {
            include: { institute: true },
          },
        },
      });
    } catch (e) {
      console.warn('[Database Auth]: Query error during login, falling back to repository store:', e);
    }
  }

  // 2. Find user in memory/persistent store
  let user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);

  // Sync user from PostgreSQL database to active store if present in DB
  if (dbUser && !user) {
    const membership = dbUser.memberships?.[0];
    user = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
      role: (membership?.role as any) || 'ADMIN',
      phoneNumber: dbUser.phoneNumber || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
      instituteId: membership?.instituteId || store.institute.id,
    };
    store.users.push(user);
  }

  // Fallback demo role lookup if user email wasn't typed but persona was picked
  if (!user && role) {
    user = store.users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(401).json({
      error: 'No account registered with this email. Please register your coaching institute first.',
    });
  }

  // 3. Verify Password
  if (password) {
    const isValid = store.verifyUserPassword(user.email, password);
    if (!isValid) {
      store.logAudit('USER_LOGIN_FAILED', 'AUTH', { email: user.email, reason: 'INVALID_PASSWORD' }, user.email);
      return res.status(401).json({
        error: 'Incorrect password. Please verify your credentials and try again.',
      });
    }
  }

  // 4. Generate Session Token
  const token = `token-${user.id}-${Date.now()}`;

  store.logAudit('USER_LOGIN_SUCCESS', 'AUTH', {
    email: user.email,
    role: user.role,
    authenticatedViaPostgres: Boolean(dbUser),
  }, user.email);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      instituteId: user.instituteId,
    },
    institute: store.institute,
    database: {
      connected: isDatabaseConnected,
      authenticatedViaPostgres: Boolean(dbUser),
      provider: isDatabaseConnected ? 'PostgreSQL (Prisma ORM)' : 'Seeded Store (Offline Mode)',
    },
  });
});

// POST /api/v1/auth/register - Register new institute and provision admin in Database & Store
router.post('/register', async (req: Request, res: Response) => {
  const { instituteName, adminName, adminEmail, password, phoneNumber } = req.body;

  if (!instituteName || !adminEmail || !adminName) {
    return res.status(400).json({ error: 'Institute legal name, administrator name, and email are required.' });
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();

  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Check if account already exists in store
  const existingStoreUser = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingStoreUser) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  // Check and persist to PostgreSQL via Prisma if connected
  let savedToDatabase = false;
  if (isDatabaseConnected) {
    try {
      const existingDbUser = await prisma.userProfile.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingDbUser) {
        return res.status(409).json({ error: 'An account with this email address already exists in the database. Please sign in.' });
      }

      // 1. Create or upsert Institute
      const instCode = instituteName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || `INST${Date.now().toString().slice(-4)}`;
      const instituteRecord = await prisma.institute.create({
        data: {
          name: instituteName.trim(),
          code: `${instCode}-${Date.now().toString().slice(-4)}`,
          contactEmail: normalizedEmail,
          contactPhone: phoneNumber || null,
          currency: 'INR',
          minAttendance: 75.0,
          scoreDeclinePct: 15.0,
        },
      });

      // 2. Create UserProfile
      const userRecord = await prisma.userProfile.create({
        data: {
          email: normalizedEmail,
          fullName: adminName.trim(),
          phoneNumber: phoneNumber || null,
        },
      });

      // 3. Create InstituteMembership
      await prisma.instituteMembership.create({
        data: {
          instituteId: instituteRecord.id,
          userId: userRecord.id,
          role: 'ADMIN',
          isActive: true,
        },
      });

      savedToDatabase = true;
    } catch (dbErr: any) {
      console.warn('[Database Auth]: Failed to persist user in PostgreSQL via Prisma, falling back to repository store:', dbErr.message);
    }
  }

  // Always persist to in-memory store for immediate zero-downtime access
  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    fullName: adminName.trim(),
    role: 'ADMIN',
    phoneNumber: phoneNumber || undefined,
    instituteId: store.institute.id,
  };

  store.users.push(newUser);
  store.setUserCredential(normalizedEmail, password || 'ApexSecureDemo2026!');
  store.institute.name = instituteName.trim();
  store.institute.contactEmail = normalizedEmail;

  store.logAudit('INSTITUTE_ONBOARDED', 'INSTITUTE', {
    instituteName,
    adminEmail: normalizedEmail,
    savedToDatabase,
  }, normalizedEmail);

  const token = `token-${newUser.id}-${Date.now()}`;

  return res.status(201).json({
    message: savedToDatabase
      ? 'Institute and administrator account successfully provisioned and saved to PostgreSQL database!'
      : 'Institute and administrator account successfully registered in persistent repository store.',
    token,
    user: newUser,
    institute: store.institute,
    database: {
      connected: isDatabaseConnected,
      savedToPostgres: savedToDatabase,
      provider: isDatabaseConnected ? 'PostgreSQL (Prisma ORM)' : 'Seeded Store (Offline Mode)',
    },
  });
});

// GET /api/v1/auth/me - Current user profile
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let user = store.users[0];

  if (authHeader && authHeader.includes('fac-')) {
    user = store.users.find(u => u.role === 'FACULTY') || user;
  } else if (authHeader && authHeader.includes('acc-')) {
    user = store.users.find(u => u.role === 'ACCOUNTANT') || user;
  } else if (authHeader && authHeader.includes('token-')) {
    const parts = authHeader.replace('Bearer ', '').split('-');
    if (parts.length >= 2) {
      const userId = `user-${parts[1]}`;
      const found = store.users.find(u => u.id === userId);
      if (found) user = found;
    }
  }

  return res.json({
    user,
    institute: store.institute,
    database: {
      connected: isDatabaseConnected,
      provider: isDatabaseConnected ? 'PostgreSQL (Prisma ORM)' : 'Seeded Store (Offline Mode)',
    },
  });
});

export default router;
