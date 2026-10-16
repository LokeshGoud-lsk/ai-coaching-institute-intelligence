import { Router, Request, Response } from 'express';
import { store } from '../db';
import { Faculty } from '../../src/types';

const router = Router();

// GET /api/v1/faculty
router.get('/', (req: Request, res: Response) => {
  return res.json(store.faculty);
});

// POST /api/v1/faculty
router.post('/', (req: Request, res: Response) => {
  const { fullName, email, phone, specialization } = req.body;

  if (!fullName || !email || !specialization) {
    return res.status(400).json({ error: 'fullName, email, and specialization are required' });
  }

  const code = `FAC-${specialization.slice(0, 3).toUpperCase()}-${String(store.faculty.length + 1).padStart(2, '0')}`;

  const newFaculty: Faculty = {
    id: `fac-${Date.now()}`,
    employeeCode: code,
    fullName,
    email,
    phone,
    specialization,
    assignedBatchesCount: 0,
    studentRating: 5.0,
  };

  store.faculty.push(newFaculty);
  store.logAudit('FACULTY_ADDED', 'FACULTY', { id: newFaculty.id, name: newFaculty.fullName });

  return res.status(201).json(newFaculty);
});

export default router;
