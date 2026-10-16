// Type definitions for AI Coaching Institute Performance & Fee Intelligence

export type UserRole = 'ADMIN' | 'FACULTY' | 'ACCOUNTANT' | 'VIEWER';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'SUSPENDED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type AssessmentType = 'WEEKLY_QUIZ' | 'UNIT_TEST' | 'MIDTERM_EXAM' | 'FINAL_EXAM' | 'MOCK_TEST';

export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH';

export type AlertStatus = 'PENDING' | 'UNDER_REVIEW' | 'INTERVENTION_SCHEDULED' | 'RESOLVED' | 'DISMISSED';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentStatus = 'CREATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'RAZORPAY' | 'UPI' | 'NET_BANKING' | 'CARD' | 'CASH' | 'CHEQUE' | 'BANK_TRANSFER';

export type NotificationType = 'ATTENDANCE_ALERT' | 'PERFORMANCE_DROP' | 'EARLY_WARNING' | 'FEE_REMINDER' | 'PAYMENT_CONFIRMATION' | 'SYSTEM';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  instituteId: string;
}

export interface Institute {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  currency: string;
  minAttendance: number;
  scoreDeclinePct: number;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  occupation?: string;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  courseId: string;
  courseName?: string;
  batchId?: string;
  batchName?: string;
  enrollmentDate: string;
  status: StudentStatus;
  guardian?: Guardian;
  notes?: string;
  // Computed / aggregated
  attendancePercentage?: number;
  latestScore?: number;
  previousScore?: number;
  scoreChange?: number;
  riskCategory?: RiskCategory;
  riskScore?: number;
  totalFeePaise?: number;
  paidFeePaise?: number;
  balanceFeePaise?: number;
}

export interface Faculty {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  assignedBatchesCount?: number;
  studentRating?: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  durationMonths: number;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  code: string;
}

export interface Batch {
  id: string;
  courseId: string;
  courseName?: string;
  leadFacultyId?: string;
  leadFacultyName?: string;
  name: string;
  code: string;
  startDate: string;
  endDate?: string;
  capacity: number;
  enrolledCount?: number;
  scheduleInfo?: string;
  room?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  status: AttendanceStatus;
  date: string;
  remarks?: string;
  batchId?: string;
}

export interface Assessment {
  id: string;
  batchId: string;
  batchName?: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  type: AssessmentType;
  examDate: string;
  maxMarks: number;
  passMarks: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
  totalSubmissions?: number;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName?: string;
  marksObtained: number | null; // null represents absent
  isAbsent: boolean;
  percentage?: number;
  grade?: string;
  feedback?: string;
}

export interface FeePlan {
  id: string;
  courseId: string;
  courseName?: string;
  name: string;
  totalPaise: number;
  installments: number;
  description?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amountPaise: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  invoiceNumber: string;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  paidPaise: number;
  balancePaise: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  lineItems: InvoiceLineItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  studentId: string;
  studentName?: string;
  amountPaise: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receiptNumber: string;
  transactionRef?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt: string;
  notes?: string;
}

export interface EarlyWarningAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  batchName: string;
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
  status: AlertStatus;
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  lastReviewedAt?: string;
  createdAt: string;
  reviewNotes?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  sourceEvidence?: Record<string, any>;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeBatches: number;
  attendanceTodayPct: number;
  averageTestScorePct: number;
  flaggedStudentsCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  feesCollectedMonthPaise: number;
  outstandingFeesPaise: number;
  overdueInvoicesCount: number;
  collectionTrend: { month: string; collectedPaise: number; targetPaise: number }[];
  attendanceTrend: { date: string; ratePct: number }[];
  recentActivities: { id: string; action: string; time: string; user: string; type: string }[];
  upcomingTests: Assessment[];
  earlyWarningAlerts: EarlyWarningAlert[];
  aiInstituteSummary: string;
}

export interface VisualizationPoint3D {
  id: string;
  studentName: string;
  batchName: string;
  attendancePct: number; // X axis
  scorePct: number;      // Y axis
  riskScore: number;     // Z axis
  riskCategory: RiskCategory;
}
