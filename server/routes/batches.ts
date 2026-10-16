import { Router, Request, Response } from 'express';
import { store } from '../db';
import { Batch } from '../../src/types';

const router = Router();

// GET /api/v1/batches
router.get('/', (req: Request, res: Response) => {
  const enriched = store.batches.map(b => {
    const enrolled = store.students.filter(s => s.batchId === b.id && s.status === 'ACTIVE').length;
    return {
      ...b,
      enrolledCount: enrolled,
    };
  });
  return res.json(enriched);
});

// POST /api/v1/batches - Create a batch
router.post('/', (req: Request, res: Response) => {
  const { courseId, leadFacultyId, name, code, startDate, capacity, scheduleInfo, room } = req.body;

  if (!courseId || !name || !code || !startDate) {
    return res.status(400).json({ error: 'courseId, name, code, and startDate are required' });
  }

  const course = store.courses.find(c => c.id === courseId);
  const faculty = store.faculty.find(f => f.id === leadFacultyId);

  const newBatch: Batch = {
    id: `batch-${Date.now()}`,
    courseId,
    courseName: course?.name,
    leadFacultyId,
    leadFacultyName: faculty?.fullName,
    name,
    code,
    startDate,
    capacity: Number(capacity) || 40,
    enrolledCount: 0,
    scheduleInfo,
    room,
  };

  store.batches.push(newBatch);
  store.logAudit('BATCH_CREATED', 'BATCH', { id: newBatch.id, name: newBatch.name });

  return res.status(201).json(newBatch);
});

export default router;
