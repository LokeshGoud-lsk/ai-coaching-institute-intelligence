import { Router, Request, Response } from 'express';
import { store } from '../db';
import { Student } from '../../src/types';
import { evaluateStudentRisk } from '../../src/lib/earlyWarningEngine';

const router = Router();

// GET /api/v1/students - List students with search, filter, and pagination
router.get('/', (req: Request, res: Response) => {
  const { search, batchId, status, courseId, limit = 50, page = 1 } = req.query;

  let filtered = [...store.students];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      s => s.fullName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }

  if (batchId) {
    filtered = filtered.filter(s => s.batchId === batchId);
  }

  if (courseId) {
    filtered = filtered.filter(s => s.courseId === courseId);
  }

  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  const pageNum = Math.max(1, parseInt(String(page)));
  const limitNum = Math.max(1, parseInt(String(limit)));
  const total = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/v1/students/:id - Detailed profile with attendance, marks, fees & risk
router.get('/:id', (req: Request, res: Response) => {
  const student = store.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Get student attendance records
  const attendance = store.attendanceRecords.filter(a => a.studentId === student.id);
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const totalSessions = attendance.length;
  const computedAttendancePct = totalSessions > 0 ? (presentCount / totalSessions) * 100 : student.attendancePercentage || 100;

  // Get student assessment results
  const results = store.assessmentResults.filter(r => r.studentId === student.id);

  // Invoices & payments
  const invoices = store.invoices.filter(i => i.studentId === student.id);
  const payments = store.payments.filter(p => p.studentId === student.id);

  // Calculate current early warning evaluation
  const riskEval = evaluateStudentRisk({
    attendancePercentage: computedAttendancePct,
    latestScore: student.latestScore ?? null,
    previousScore: student.previousScore ?? null,
    repeatedAbsencesCount: student.riskCategory === 'HIGH' ? 4 : 0,
    missingAssessmentsCount: 0,
    configuredMinAttendance: store.institute.minAttendance,
    configuredDeclineThreshold: store.institute.scoreDeclinePct,
  });

  return res.json({
    student: {
      ...student,
      attendancePercentage: Math.round(computedAttendancePct * 10) / 10,
      riskCategory: riskEval.riskCategory,
      riskScore: riskEval.riskScore,
    },
    attendance,
    assessmentResults: results,
    invoices,
    payments,
    earlyWarningEvaluation: riskEval,
  });
});

// POST /api/v1/students - Create a new student record
router.post('/', (req: Request, res: Response) => {
  const { fullName, email, phone, courseId, batchId, guardian, notes } = req.body;

  if (!fullName || !email || !courseId) {
    return res.status(400).json({ error: 'Full name, email, and course are required.' });
  }

  const course = store.courses.find(c => c.id === courseId);
  const batch = store.batches.find(b => b.id === batchId);

  const studentCount = store.students.length + 1;
  const code = `APEX-2026-${String(studentCount).padStart(3, '0')}`;

  const newStudent: Student = {
    id: `stu-${Date.now()}`,
    studentCode: code,
    fullName,
    email,
    phone,
    courseId,
    courseName: course?.name,
    batchId,
    batchName: batch?.name,
    enrollmentDate: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
    guardian,
    notes,
    attendancePercentage: 100,
    latestScore: undefined,
    previousScore: undefined,
    riskCategory: 'LOW',
    riskScore: 5,
    totalFeePaise: 18000000,
    paidFeePaise: 0,
    balanceFeePaise: 18000000,
  };

  store.students.unshift(newStudent);
  store.logAudit('STUDENT_CREATED', 'STUDENT', { id: newStudent.id, name: newStudent.fullName });

  return res.status(201).json(newStudent);
});

// PUT /api/v1/students/:id - Update student record
router.put('/:id', (req: Request, res: Response) => {
  const index = store.students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const existing = store.students[index];
  const updated: Student = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID overwrite
  };

  store.students[index] = updated;
  store.logAudit('STUDENT_UPDATED', 'STUDENT', { id: updated.id, name: updated.fullName });

  return res.json(updated);
});

// DELETE /api/v1/students/:id - Archive student
router.delete('/:id', (req: Request, res: Response) => {
  const index = store.students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  store.students[index].status = 'INACTIVE';
  store.logAudit('STUDENT_ARCHIVED', 'STUDENT', { id: req.params.id });

  return res.json({ message: 'Student archived successfully', student: store.students[index] });
});

export default router;
