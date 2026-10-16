import { Router, Request, Response } from 'express';
import { store } from '../db';
import { evaluateStudentRisk } from '../../src/lib/earlyWarningEngine';
import { EarlyWarningAlert, AlertStatus } from '../../src/types';

const router = Router();

// GET /api/v1/early-warning/alerts - List all early warning alerts
router.get('/alerts', (req: Request, res: Response) => {
  const { category, status, batchId } = req.query;

  let alerts = [...store.earlyWarningAlerts];

  if (category) {
    alerts = alerts.filter(a => a.riskCategory === category);
  }

  if (status) {
    alerts = alerts.filter(a => a.status === status);
  }

  if (batchId) {
    const studentIdsInBatch = new Set(store.students.filter(s => s.batchId === batchId).map(s => s.id));
    alerts = alerts.filter(a => studentIdsInBatch.has(a.studentId));
  }

  return res.json(alerts);
});

// POST /api/v1/early-warning/evaluate-all - Run deterministic evaluation on all active students
router.post('/evaluate-all', (req: Request, res: Response) => {
  const activeStudents = store.students.filter(s => s.status === 'ACTIVE');
  let newAlertsCount = 0;

  activeStudents.forEach(student => {
    // 1. Calculate actual attendance
    const attendance = store.attendanceRecords.filter(a => a.studentId === student.id);
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const attPct = attendance.length > 0 ? (present / attendance.length) * 100 : (student.attendancePercentage ?? 90);

    // 2. Count consecutive recent absences
    let consecutiveAbsences = 0;
    const sortedAttendance = [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const record of sortedAttendance) {
      if (record.status === 'ABSENT') {
        consecutiveAbsences++;
      } else {
        break;
      }
    }

    // 3. Evaluate risk rules deterministically
    const evaluation = evaluateStudentRisk({
      attendancePercentage: attPct,
      latestScore: student.latestScore ?? null,
      previousScore: student.previousScore ?? null,
      repeatedAbsencesCount: consecutiveAbsences,
      missingAssessmentsCount: 0,
      configuredMinAttendance: store.institute.minAttendance,
      configuredDeclineThreshold: store.institute.scoreDeclinePct,
    });

    // Update student model cache
    student.attendancePercentage = Math.round(attPct * 10) / 10;
    student.riskCategory = evaluation.riskCategory;
    student.riskScore = evaluation.riskScore;

    // Check if an existing open alert exists
    const existingIndex = store.earlyWarningAlerts.findIndex(
      a => a.studentId === student.id && a.status !== 'RESOLVED' && a.status !== 'DISMISSED'
    );

    if (evaluation.riskCategory !== 'LOW') {
      const assignedFaculty = store.faculty[0];
      const alertPayload: EarlyWarningAlert = {
        id: existingIndex !== -1 ? store.earlyWarningAlerts[existingIndex].id : `alert-${Date.now()}-${student.id}`,
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.studentCode,
        batchName: student.batchName || 'General Batch',
        riskScore: evaluation.riskScore,
        riskCategory: evaluation.riskCategory,
        primaryFactors: evaluation.primaryFactors,
        evidenceData: evaluation.evidenceData,
        recommendedAction: evaluation.recommendedAction,
        status: existingIndex !== -1 ? store.earlyWarningAlerts[existingIndex].status : 'PENDING',
        assignedFacultyId: assignedFaculty.id,
        assignedFacultyName: assignedFaculty.fullName,
        createdAt: existingIndex !== -1 ? store.earlyWarningAlerts[existingIndex].createdAt : new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        store.earlyWarningAlerts[existingIndex] = alertPayload;
      } else {
        store.earlyWarningAlerts.unshift(alertPayload);
        newAlertsCount++;
      }
    }
  });

  store.logAudit('EARLY_WARNING_EVALUATION_RUN', 'EARLY_WARNING', {
    totalEvaluated: activeStudents.length,
    newAlertsGenerated: newAlertsCount,
  });

  return res.json({
    message: 'Early Warning evaluation completed.',
    totalEvaluated: activeStudents.length,
    activeAlerts: store.earlyWarningAlerts.filter(a => a.status !== 'RESOLVED' && a.status !== 'DISMISSED'),
  });
});

// PUT /api/v1/early-warning/alerts/:id/review - Review, assign, or resolve an alert
router.put('/alerts/:id/review', (req: Request, res: Response) => {
  const alertIndex = store.earlyWarningAlerts.findIndex(a => a.id === req.params.id);
  if (alertIndex === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  const { status, reviewNotes, assignedFacultyId } = req.body;
  const alert = store.earlyWarningAlerts[alertIndex];

  let facultyName = alert.assignedFacultyName;
  if (assignedFacultyId) {
    const f = store.faculty.find(item => item.id === assignedFacultyId);
    if (f) facultyName = f.fullName;
  }

  const updated: EarlyWarningAlert = {
    ...alert,
    status: (status as AlertStatus) || alert.status,
    reviewNotes: reviewNotes || alert.reviewNotes,
    assignedFacultyId: assignedFacultyId || alert.assignedFacultyId,
    assignedFacultyName: facultyName,
    lastReviewedAt: new Date().toISOString(),
  };

  store.earlyWarningAlerts[alertIndex] = updated;

  store.logAudit('ALERT_REVIEWED', 'EARLY_WARNING', {
    alertId: alert.id,
    student: alert.studentName,
    newStatus: updated.status,
    notes: reviewNotes,
  });

  return res.json(updated);
});

export default router;
