import { Router, Request, Response } from 'express';
import { store } from '../db';

const router = Router();

// Login endpoint with role selection support
router.post('/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email or fallback to demo role user
  let user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user && role) {
    user = store.users.find(u => u.role === role);
  }

  if (!user) {
    // Default to admin for convenient demo evaluation
    user = store.users[0];
  }

  // Create session token (in production with Supabase Auth or JWT)
  const token = `token-${user.id}-${Date.now()}`;

  store.logAudit('USER_LOGIN', 'AUTH', { email: user.email, role: user.role }, user.email);

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
  });
});

// Current user profile
router.get('/me', (req: Request, res: Response) => {
  // Return the first admin by default or user based on header
  const authHeader = req.headers.authorization;
  let user = store.users[0];

  if (authHeader && authHeader.includes('fac-')) {
    user = store.users.find(u => u.role === 'FACULTY') || user;
  } else if (authHeader && authHeader.includes('acc-')) {
    user = store.users.find(u => u.role === 'ACCOUNTANT') || user;
  }

  return res.json({
    user,
    institute: store.institute,
  });
});

// Registration endpoint
router.post('/register', (req: Request, res: Response) => {
  const { instituteName, adminName, adminEmail } = req.body;

  if (!instituteName || !adminEmail || !adminName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: adminEmail,
    fullName: adminName,
    role: 'ADMIN' as const,
    instituteId: store.institute.id,
  };

  store.users.push(newUser);
  store.institute.name = instituteName;
  store.logAudit('INSTITUTE_ONBOARDED', 'INSTITUTE', { instituteName, adminEmail }, adminEmail);

  return res.status(201).json({
    message: 'Institute registered successfully',
    user: newUser,
    institute: store.institute,
  });
});

export default router;
