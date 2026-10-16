import { Router, Request, Response } from 'express';
import { store } from '../db';
import { Assessment, AssessmentResult } from '../../src/types';

const router = Router();

// GET /api/v1/assessments - List assessments with aggregated stats
router.get('/', (req: Request, res: Response) => {
  const { batchId } = req.query;

  let exams = [...store.assessments];
  if (batchId) {
    exams = exams.filter(e => e.batchId === batchId);
  }

  // Enrich with dynamic submission metrics
  const enriched = exams.map(exam => {
    const results = store.assessmentResults.filter(r => r.assessmentId === exam.id);
    const validScores = results.filter(r => r.marksObtained !== null).map(r => r.marksObtained as number);
    
    const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : exam.averageScore;
    const max = validScores.length > 0 ? Math.max(...validScores) : exam.highestScore;
    const min = validScores.length > 0 ? Math.min(...validScores) : exam.lowestScore;

    return {
      ...exam,
      averageScore: avg ? Math.round(avg * 10) / 10 : undefined,
      highestScore: max ? Math.round(max * 10) / 10 : undefined,
      lowestScore: min ? Math.round(min * 10) / 10 : undefined,
      totalSubmissions: results.length,
    };
  });

  return res.json(enriched);
});

// POST /api/v1/assessments - Create a new assessment
router.post('/', (req: Request, res: Response) => {
  const { batchId, subjectId, title, type, examDate, maxMarks, passMarks } = req.body;

  if (!batchId || !title || !examDate || !maxMarks) {
    return res.status(400).json({ error: 'batchId, title, examDate, and maxMarks are required' });
  }

  const batch = store.batches.find(b => b.id === batchId);

  const newExam: Assessment = {
    id: `exam-${Date.now()}`,
    batchId,
    batchName: batch?.name,
    subjectId: subjectId || 'sub-gen',
    title,
    type: type || 'UNIT_TEST',
    examDate,
    maxMarks: parseFloat(maxMarks),
    passMarks: passMarks ? parseFloat(passMarks) : Math.round(parseFloat(maxMarks) * 0.4),
    averageScore: undefined,
    highestScore: undefined,
    lowestScore: undefined,
    totalSubmissions: 0,
  };

  store.assessments.unshift(newExam);
  store.logAudit('ASSESSMENT_CREATED', 'ASSESSMENT', { id: newExam.id, title: newExam.title });

  return res.status(201).json(newExam);
});

// GET /api/v1/assessments/:id/results - Get results table for an assessment
router.get('/:id/results', (req: Request, res: Response) => {
  const exam = store.assessments.find(e => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  // Get enrolled students for the exam's batch
  const batchStudents = store.students.filter(s => s.batchId === exam.batchId);
  const existingResults = store.assessmentResults.filter(r => r.assessmentId === exam.id);

  // Return merged list so all students appear in marks entry sheet
  const merged = batchStudents.map(student => {
    const res = existingResults.find(r => r.studentId === student.id);
    return {
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      marksObtained: res ? res.marksObtained : null,
      isAbsent: res ? res.isAbsent : false,
      percentage: res ? res.percentage : null,
      grade: res ? res.grade : undefined,
      feedback: res ? res.feedback : undefined,
    };
  });

  return res.json({
    assessment: exam,
    results: merged,
  });
});

// POST /api/v1/assessments/:id/results - Submit / update marks
router.post('/:id/results', (req: Request, res: Response) => {
  const exam = store.assessments.find(e => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  const { results } = req.body;
  if (!Array.isArray(results)) {
    return res.status(400).json({ error: 'results array is required' });
  }

  results.forEach((item: { studentId: string; marksObtained: number | null; isAbsent?: boolean; feedback?: string }) => {
    const student = store.students.find(s => s.id === item.studentId);
    if (!student) return;

    const isAbsent = item.isAbsent || item.marksObtained === null;
    const marks = isAbsent ? null : Math.min(exam.maxMarks, Math.max(0, Number(item.marksObtained)));
    const pct = marks !== null ? Math.round((marks / exam.maxMarks) * 100 * 10) / 10 : null;

    let grade = 'F';
    if (pct !== null) {
      if (pct >= 85) grade = 'A+';
      else if (pct >= 70) grade = 'A';
      else if (pct >= 55) grade = 'B';
      else if (pct >= 40) grade = 'C';
    }

    const existingIdx = store.assessmentResults.findIndex(
      r => r.assessmentId === exam.id && r.studentId === item.studentId
    );

    const resultPayload: AssessmentResult = {
      id: existingIdx !== -1 ? store.assessmentResults[existingIdx].id : `res-${exam.id}-${item.studentId}`,
      assessmentId: exam.id,
      studentId: item.studentId,
      studentName: student.fullName,
      marksObtained: marks,
      isAbsent,
      percentage: pct || undefined,
      grade: isAbsent ? 'ABSENT' : grade,
      feedback: item.feedback,
    };

    if (existingIdx !== -1) {
      store.assessmentResults[existingIdx] = resultPayload;
    } else {
      store.assessmentResults.push(resultPayload);
    }

    // Update student's latest & previous scores
    if (pct !== null) {
      if (student.latestScore !== undefined) {
        student.previousScore = student.latestScore;
        student.latestScore = pct;
        student.scoreChange = Math.round((student.latestScore - student.previousScore) * 10) / 10;
      } else {
        student.latestScore = pct;
      }
    }
  });

  store.logAudit('ASSESSMENT_MARKS_RECORDED', 'ASSESSMENT', { assessmentId: exam.id, count: results.length });

  return res.json({ message: 'Assessment results saved successfully' });
});

export default router;
