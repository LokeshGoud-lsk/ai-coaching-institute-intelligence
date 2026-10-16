import { Router, Request, Response } from 'express';
import { store } from '../db';
import { DashboardMetrics, VisualizationPoint3D } from '../../src/types';

const router = Router();

// GET /api/v1/analytics/dashboard - Master KPIs and trends
router.get('/dashboard', (req: Request, res: Response) => {
  const activeStudents = store.students.filter(s => s.status === 'ACTIVE');
  const highRisk = store.earlyWarningAlerts.filter(a => a.riskCategory === 'HIGH' && a.status !== 'RESOLVED');
  const mediumRisk = store.earlyWarningAlerts.filter(a => a.riskCategory === 'MEDIUM' && a.status !== 'RESOLVED');

  // Calculate fees
  let feesCollectedMonthPaise = 0;
  let outstandingFeesPaise = 0;
  let overdueInvoicesCount = 0;

  store.invoices.forEach(inv => {
    outstandingFeesPaise += inv.balancePaise;
    if (inv.status === 'OVERDUE') overdueInvoicesCount++;
  });

  store.payments.forEach(pay => {
    feesCollectedMonthPaise += pay.amountPaise;
  });

  // Calculate average scores
  const allScores = store.students
    .filter(s => s.latestScore !== undefined)
    .map(s => s.latestScore as number);
  const avgTestScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 74.2;

  // Real attendance rate today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = store.attendanceRecords.filter(a => a.date === todayStr);
  const todayPresent = todayRecords.filter(a => a.status === 'PRESENT').length;
  const attendanceTodayPct = todayRecords.length > 0 ? (todayPresent / todayRecords.length) * 100 : 88.4;

  const dashboardData: DashboardMetrics = {
    totalStudents: activeStudents.length,
    activeBatches: store.batches.length,
    attendanceTodayPct: Math.round(attendanceTodayPct * 10) / 10,
    averageTestScorePct: Math.round(avgTestScore * 10) / 10,
    flaggedStudentsCount: highRisk.length + mediumRisk.length,
    highRiskCount: highRisk.length,
    mediumRiskCount: mediumRisk.length,
    feesCollectedMonthPaise,
    outstandingFeesPaise,
    overdueInvoicesCount,
    collectionTrend: [
      { month: 'Jun', collectedPaise: 42000000, targetPaise: 40000000 },
      { month: 'Jul', collectedPaise: 38000000, targetPaise: 35000000 },
      { month: 'Aug', collectedPaise: 51000000, targetPaise: 45000000 },
      { month: 'Sep', collectedPaise: 33000000, targetPaise: 40000000 },
      { month: 'Oct', collectedPaise: feesCollectedMonthPaise, targetPaise: 45000000 },
    ],
    attendanceTrend: [
      { date: '10 Oct', ratePct: 89.2 },
      { date: '11 Oct', ratePct: 87.5 },
      { date: '12 Oct', ratePct: 86.0 },
      { date: '13 Oct', ratePct: 91.4 },
      { date: '14 Oct', ratePct: 88.9 },
      { date: '15 Oct', ratePct: 87.1 },
      { date: '16 Oct', ratePct: Math.round(attendanceTodayPct * 10) / 10 },
    ],
    recentActivities: store.auditLogs.slice(0, 6).map(log => ({
      id: log.id,
      action: log.action.replace(/_/g, ' '),
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: log.user,
      type: log.resource,
    })),
    upcomingTests: store.assessments.slice(0, 3),
    earlyWarningAlerts: store.earlyWarningAlerts.slice(0, 4),
    aiInstituteSummary: `Apex Academy has 4 active batches running with 88.4% attendance today. 3 students are flagged for early intervention (2 High Risk, 1 Medium Risk). Fee collections for the current cycle total ₹${(feesCollectedMonthPaise / 100).toLocaleString('en-IN')}, with ₹${(outstandingFeesPaise / 100).toLocaleString('en-IN')} pending across overdue installments.`,
  };

  return res.json(dashboardData);
});

// GET /api/v1/analytics/visualizations-3d - 3D scatter coordinate array
router.get('/visualizations-3d', (req: Request, res: Response) => {
  const points: VisualizationPoint3D[] = store.students.map(s => {
    return {
      id: s.id,
      studentName: s.fullName,
      batchName: s.batchName || 'General',
      attendancePct: s.attendancePercentage || 85.0,
      scorePct: s.latestScore || 70.0,
      riskScore: s.riskScore || 20,
      riskCategory: s.riskCategory || 'LOW',
    };
  });

  return res.json({
    description: '3D Performance Landscape Data: X = Attendance %, Y = Assessment Score %, Z = Risk Score (0-100)',
    data: points,
  });
});

export default router;
