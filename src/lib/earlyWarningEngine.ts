// Transparent, explainable, deterministic Early Warning Intelligence Engine
// Combines multiple academic and attendance signals into an auditable 0-100 risk score.
// NOTE: This is an early-warning indicator for proactive educator intervention, not a guaranteed prediction.

import { RiskCategory } from '../types';

export interface EarlyWarningInput {
  attendancePercentage: number;
  latestScore: number | null; // null if absent or not taken
  previousScore: number | null;
  repeatedAbsencesCount: number;
  missingAssessmentsCount: number;
  configuredMinAttendance?: number; // Institute configured threshold, default 75%
  configuredDeclineThreshold?: number; // Institute configured decline pct, default 15%
}

export interface EarlyWarningEvaluation {
  riskScore: number; // 0 - 100
  riskCategory: RiskCategory;
  primaryFactors: string[];
  evidenceData: {
    attendancePct: number;
    prevScore?: number;
    latestScore?: number;
    scoreDeclinePct?: number;
    repeatedAbsences?: number;
    missingAssessments?: number;
  };
  recommendedAction: string;
}

/**
 * Calculates attendance risk points (0 - 40 points)
 */
export function calculateAttendanceRiskPoints(attendancePct: number, threshold = 75): { points: number; factor: string | null } {
  if (attendancePct >= threshold) {
    return { points: 0, factor: null };
  }
  
  // Severe attendance deficit (< 50%) -> 40 points
  if (attendancePct < 50) {
    return {
      points: 40,
      factor: `Critical attendance deficit: currently at ${attendancePct.toFixed(1)}% (Threshold: ${threshold}%)`,
    };
  }
  
  // Moderate deficit (50% - 74%) -> scaled between 15 and 35 points
  const deficit = threshold - attendancePct;
  const scaledPoints = Math.round(15 + (deficit / 25) * 20);
  return {
    points: Math.min(35, scaledPoints),
    factor: `Attendance below policy: currently at ${attendancePct.toFixed(1)}% (Threshold: ${threshold}%)`,
  };
}

/**
 * Calculates academic decline risk points (0 - 35 points)
 */
export function calculateScoreDeclineRiskPoints(
  latestScore: number | null,
  previousScore: number | null,
  declineThreshold = 15
): { points: number; factor: string | null; declinePct: number } {
  if (latestScore === null && previousScore === null) {
    return { points: 0, factor: null, declinePct: 0 };
  }

  // If latest score is failing (< 40%) regardless of previous
  if (latestScore !== null && latestScore < 40) {
    const points = latestScore < 25 ? 30 : 20;
    return {
      points,
      factor: `Sub-par latest test result: scored ${latestScore.toFixed(1)}% (Passing: 40%)`,
      declinePct: previousScore ? Math.max(0, previousScore - latestScore) : 0,
    };
  }

  // If we have both scores, check percentage point drop
  if (latestScore !== null && previousScore !== null) {
    const drop = previousScore - latestScore;
    if (drop >= declineThreshold) {
      return {
        points: Math.min(35, Math.round(15 + drop * 0.8)),
        factor: `Significant academic drop: dropped ${drop.toFixed(1)}% from previous ${previousScore.toFixed(1)}% to ${latestScore.toFixed(1)}%`,
        declinePct: drop,
      };
    }
  }

  return { points: 0, factor: null, declinePct: 0 };
}

/**
 * Calculates behavioral and missing assessment risk points (0 - 25 points)
 */
export function calculateAssessmentHabitRiskPoints(
  repeatedAbsences: number,
  missingAssessments: number
): { points: number; factors: string[] } {
  let points = 0;
  const factors: string[] = [];

  if (repeatedAbsences >= 3) {
    points += Math.min(15, repeatedAbsences * 4);
    factors.push(`Repeated consecutive absences: ${repeatedAbsences} consecutive sessions missed`);
  }

  if (missingAssessments > 0) {
    points += Math.min(10, missingAssessments * 5);
    factors.push(`Unsubmitted/Absent tests: missed ${missingAssessments} scheduled assessments`);
  }

  return { points: Math.min(25, points), factors };
}

/**
 * Master deterministic evaluation function
 */
export function evaluateStudentRisk(input: EarlyWarningInput): EarlyWarningEvaluation {
  const minAttendance = input.configuredMinAttendance ?? 75;
  const declineThreshold = input.configuredDeclineThreshold ?? 15;

  const attendanceRisk = calculateAttendanceRiskPoints(input.attendancePercentage, minAttendance);
  const academicRisk = calculateScoreDeclineRiskPoints(input.latestScore, input.previousScore, declineThreshold);
  const habitRisk = calculateAssessmentHabitRiskPoints(input.repeatedAbsencesCount, input.missingAssessmentsCount);

  // Total risk score capped from 0 to 100
  const rawScore = attendanceRisk.points + academicRisk.points + habitRisk.points;
  const riskScore = Math.min(100, Math.max(0, rawScore));

  // Determine category
  let riskCategory: RiskCategory = 'LOW';
  if (riskScore >= 70) {
    riskCategory = 'HIGH';
  } else if (riskScore >= 40) {
    riskCategory = 'MEDIUM';
  }

  // Compile factors
  const primaryFactors: string[] = [];
  if (attendanceRisk.factor) primaryFactors.push(attendanceRisk.factor);
  if (academicRisk.factor) primaryFactors.push(academicRisk.factor);
  primaryFactors.push(...habitRisk.factors);

  if (primaryFactors.length === 0) {
    primaryFactors.push('Academic performance and attendance are currently on track.');
  }

  // Formulate recommended action
  let recommendedAction = 'Continue routine monitoring.';
  if (riskCategory === 'HIGH') {
    recommendedAction = 'Schedule urgent parent-faculty consultation, assign 1-on-1 subject mentor, and conduct attendance review.';
  } else if (riskCategory === 'MEDIUM') {
    recommendedAction = 'Faculty check-in during doubt-clearing session; verify reason for recent missed topics or test drop.';
  }

  return {
    riskScore,
    riskCategory,
    primaryFactors,
    evidenceData: {
      attendancePct: Math.round(input.attendancePercentage * 10) / 10,
      prevScore: input.previousScore !== null ? Math.round(input.previousScore * 10) / 10 : undefined,
      latestScore: input.latestScore !== null ? Math.round(input.latestScore * 10) / 10 : undefined,
      scoreDeclinePct: academicRisk.declinePct > 0 ? Math.round(academicRisk.declinePct * 10) / 10 : undefined,
      repeatedAbsences: input.repeatedAbsencesCount > 0 ? input.repeatedAbsencesCount : undefined,
      missingAssessments: input.missingAssessmentsCount > 0 ? input.missingAssessmentsCount : undefined,
    },
    recommendedAction,
  };
}
