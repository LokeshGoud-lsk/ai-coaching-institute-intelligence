// Database repository & store provider for AI Coaching Institute Intelligence
// Supports Prisma ORM when DATABASE_URL is configured, and provides an in-memory/persistent store for zero-downtime execution.

import { PrismaClient } from '@prisma/client';
import {
  SEED_INSTITUTE,
  SEED_USERS,
  SEED_COURSES,
  SEED_FACULTY,
  SEED_BATCHES,
  SEED_STUDENTS,
  SEED_ASSESSMENTS,
  SEED_FEE_PLANS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_EARLY_WARNING_ALERTS,
  SEED_NOTIFICATIONS,
} from './seedData';
import {
  Student,
  Batch,
  Course,
  Faculty,
  Assessment,
  AssessmentResult,
  AttendanceRecord,
  FeePlan,
  Invoice,
  Payment,
  EarlyWarningAlert,
  NotificationItem,
  UserProfile,
  Institute,
} from '../src/types';

// Prisma client initialization with graceful connection check
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export let isDatabaseConnected = false;

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!process.env.DATABASE_URL) {
    isDatabaseConnected = false;
    return {
      connected: false,
      message: 'DATABASE_URL is not configured in .env. Running on seeded repository store.',
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    return {
      connected: true,
      message: 'Successfully connected to PostgreSQL database via Prisma ORM.',
    };
  } catch (error: any) {
    isDatabaseConnected = false;
    return {
      connected: false,
      message: `PostgreSQL connection error: ${error.message || error}`,
    };
  }
}

export class DataStore {
  institute: Institute = { ...SEED_INSTITUTE };
  users: UserProfile[] = [...SEED_USERS];
  courses: Course[] = [...SEED_COURSES];
  faculty: Faculty[] = [...SEED_FACULTY];
  batches: Batch[] = [...SEED_BATCHES];
  students: Student[] = [...SEED_STUDENTS];
  assessments: Assessment[] = [...SEED_ASSESSMENTS];
  assessmentResults: AssessmentResult[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  feePlans: FeePlan[] = [...SEED_FEE_PLANS];
  invoices: Invoice[] = [...SEED_INVOICES];
  payments: Payment[] = [...SEED_PAYMENTS];
  earlyWarningAlerts: EarlyWarningAlert[] = [...SEED_EARLY_WARNING_ALERTS];
  notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];
  auditLogs: { id: string; action: string; resource: string; details: any; timestamp: string; user: string }[] = [];

  constructor() {
    this.initDefaultRecords();
  }

  private initDefaultRecords() {
    // Generate initial attendance records for past 14 days
    const today = new Date();
    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().slice(0, 10);
      
      this.students.forEach(student => {
        // Deterministic attendance based on student profile
        let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' = 'PRESENT';
        if (student.id === 'stu-101' && (dayOffset === 1 || dayOffset === 2 || dayOffset === 3 || dayOffset === 7 || dayOffset === 9)) {
          status = 'ABSENT';
        } else if (student.id === 'stu-105' && (dayOffset <= 4)) {
          status = 'ABSENT';
        } else if (student.id === 'stu-103' && (dayOffset === 4 || dayOffset === 8)) {
          status = 'ABSENT';
        } else if (dayOffset % 6 === 0) {
          status = 'PRESENT';
        }

        this.attendanceRecords.push({
          id: `att-${student.id}-${dateStr}`,
          sessionId: `sess-${student.batchId || 'b1'}-${dateStr}`,
          studentId: student.id,
          studentName: student.fullName,
          status,
          date: dateStr,
          batchId: student.batchId,
        });
      });
    }

    // Generate initial assessment results
    this.assessments.forEach(exam => {
      this.students.forEach(student => {
        if (student.batchId === exam.batchId) {
          let marks: number | null = 75;
          let isAbsent = false;

          if (student.id === 'stu-101') marks = exam.id === 'exam-01' ? 54 : 78;
          else if (student.id === 'stu-102') marks = exam.id === 'exam-03' ? 350 : 92;
          else if (student.id === 'stu-105') marks = exam.id === 'exam-04' ? 38 : 66;
          else marks = Math.round(60 + (student.fullName.charCodeAt(0) % 35));

          const pct = marks !== null ? Math.round((marks / exam.maxMarks) * 100 * 10) / 10 : null;

          this.assessmentResults.push({
            id: `res-${exam.id}-${student.id}`,
            assessmentId: exam.id,
            studentId: student.id,
            studentName: student.fullName,
            marksObtained: marks,
            isAbsent,
            percentage: pct || undefined,
            grade: pct && pct >= 80 ? 'A+' : pct && pct >= 65 ? 'B+' : pct && pct >= 40 ? 'C' : 'F',
          });
        }
      });
    });
  }

  logAudit(action: string, resource: string, details: any, user = 'admin@apexacademy.edu.in') {
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
      user,
    });
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }
}

export const store = new DataStore();
