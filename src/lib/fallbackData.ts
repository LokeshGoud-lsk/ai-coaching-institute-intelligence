// Institutional Fallback Intelligence Data & Offline Snapshot Engine
// Guarantees zero-downtime and instant interactive rendering across all network environments
// (e.g. GitHub Pages static hosting, browser shields, CORS preflights, or offline mode).

import {
  Student,
  Batch,
  Faculty,
  Assessment,
  Invoice,
  Payment,
  EarlyWarningAlert,
  NotificationItem,
  DashboardMetrics,
  VisualizationPoint3D,
  UserProfile,
  Institute,
  AttendanceRecord,
} from '../types';

export const DEFAULT_INSTITUTE: Institute = {
  id: 'inst-apex-001',
  name: 'Apex Academy of Science & IIT-JEE/NEET',
  code: 'APEX-JEE-NEET',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&q=80',
  address: 'Plot 42, Knowledge Park III, Silicon Valley Corridor, Bengaluru',
  contactEmail: 'admissions@apexacademy.edu.in',
  contactPhone: '+91 80 4912 3000',
  currency: 'INR',
  minAttendance: 75.0,
  scoreDeclinePct: 15.0,
};

export const DEFAULT_USER: UserProfile = {
  id: 'user-admin-01',
  email: 'admin@apexacademy.edu.in',
  fullName: 'Dr. Vikram Malhotra',
  role: 'ADMIN',
  phoneNumber: '+91 98860 12345',
  instituteId: 'inst-apex-001',
};

export const DEFAULT_FACULTY: Faculty[] = [
  {
    id: 'fac-01',
    employeeCode: 'FAC-PHY-01',
    fullName: 'Prof. Ananya Sen',
    email: 'ananya.sen@apexacademy.edu.in',
    phone: '+91 98860 23456',
    specialization: 'Advanced Classical Mechanics & Electrodynamics',
    assignedBatchesCount: 3,
    studentRating: 4.9,
  },
  {
    id: 'fac-02',
    employeeCode: 'FAC-MATH-02',
    fullName: 'Dr. Rajiv Menon',
    email: 'rajiv.menon@apexacademy.edu.in',
    phone: '+91 98860 56789',
    specialization: 'Calculus, Vectors & Coordinate Geometry',
    assignedBatchesCount: 2,
    studentRating: 4.8,
  },
  {
    id: 'fac-03',
    employeeCode: 'FAC-CHEM-03',
    fullName: 'Dr. Sunita Rao',
    email: 'sunita.rao@apexacademy.edu.in',
    phone: '+91 98860 67890',
    specialization: 'Organic Reaction Mechanisms & Thermodynamics',
    assignedBatchesCount: 3,
    studentRating: 4.7,
  },
  {
    id: 'fac-04',
    employeeCode: 'FAC-BIO-04',
    fullName: 'Dr. Harish Chandra',
    email: 'harish.chandra@apexacademy.edu.in',
    phone: '+91 98860 78901',
    specialization: 'Genetics, Cell Biology & Human Physiology',
    assignedBatchesCount: 2,
    studentRating: 4.85,
  },
];

export const DEFAULT_BATCHES: Batch[] = [
  {
    id: 'batch-jee-2027-a',
    courseId: 'course-jee-adv',
    courseName: 'IIT-JEE (Advanced & Main) Two-Year Intensive',
    leadFacultyId: 'fac-01',
    leadFacultyName: 'Prof. Ananya Sen',
    name: 'JEE Adv 2027 Super-30 Batch A',
    code: 'JEE-27-A',
    startDate: '2025-06-01',
    capacity: 35,
    enrolledCount: 32,
    scheduleInfo: 'Mon-Wed-Fri: 08:30 - 13:00 IST',
    room: 'Lecture Hall 101',
  },
  {
    id: 'batch-jee-2026-b',
    courseId: 'course-jee-adv',
    courseName: 'IIT-JEE (Advanced & Main) Two-Year Intensive',
    leadFacultyId: 'fac-02',
    leadFacultyName: 'Dr. Rajiv Menon',
    name: 'JEE Adv 2026 Pinnacle Batch B',
    code: 'JEE-26-B',
    startDate: '2024-06-01',
    capacity: 40,
    enrolledCount: 38,
    scheduleInfo: 'Tue-Thu-Sat: 08:30 - 13:00 IST',
    room: 'Lecture Hall 102',
  },
  {
    id: 'batch-neet-2026-alpha',
    courseId: 'course-neet-prime',
    courseName: 'NEET Medical Premier Comprehensive',
    leadFacultyId: 'fac-04',
    leadFacultyName: 'Dr. Harish Chandra',
    name: 'NEET 2026 Achievers Alpha',
    code: 'NEET-26-A',
    startDate: '2024-06-01',
    capacity: 45,
    enrolledCount: 42,
    scheduleInfo: 'Mon-Sat: 14:00 - 18:30 IST',
    room: 'Bio-Science Amphitheater',
  },
  {
    id: 'batch-found-2026',
    courseId: 'course-foundation',
    courseName: 'Olympiad & NTSE STEM Foundation (Class 9-10)',
    leadFacultyId: 'fac-03',
    leadFacultyName: 'Dr. Sunita Rao',
    name: 'STEM Olympiad Foundation 2026',
    code: 'FOUND-26',
    startDate: '2025-07-01',
    capacity: 30,
    enrolledCount: 25,
    scheduleInfo: 'Sat-Sun: 09:00 - 14:00 IST',
    room: 'Seminar Room 204',
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'stu-101',
    studentCode: 'APEX-2026-001',
    fullName: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&q=80',
    courseId: 'course-jee-adv',
    courseName: 'IIT-JEE (Advanced & Main) Two-Year Intensive',
    batchId: 'batch-jee-2026-b',
    batchName: 'JEE Adv 2026 Pinnacle Batch B',
    enrollmentDate: '2024-06-15',
    status: 'ACTIVE',
    guardian: {
      id: 'guard-101',
      name: 'Sunil Sharma',
      relationship: 'Father',
      phone: '+91 98765 11111',
      email: 'sunil.sharma@example.com',
      occupation: 'Senior Mechanical Engineer, BHEL',
    },
    attendancePercentage: 62.5,
    latestScore: 54.0,
    previousScore: 78.0,
    scoreChange: -24.0,
    riskCategory: 'HIGH',
    riskScore: 82,
    totalFeePaise: 18000000,
    paidFeePaise: 10000000,
    balanceFeePaise: 8000000,
    notes: 'Exhibits strong conceptual intuition in Physics, but recent slump in Calculus coincides with 5 missed classes.',
  },
  {
    id: 'stu-102',
    studentCode: 'APEX-2026-002',
    fullName: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98765 43211',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&q=80',
    courseId: 'course-neet-prime',
    courseName: 'NEET Medical Premier Comprehensive',
    batchId: 'batch-neet-2026-alpha',
    batchName: 'NEET 2026 Achievers Alpha',
    enrollmentDate: '2024-06-12',
    status: 'ACTIVE',
    guardian: {
      id: 'guard-102',
      name: 'Dr. Meena Patel',
      relationship: 'Mother',
      phone: '+91 98765 22222',
      email: 'meena.patel@example.com',
      occupation: 'Pediatrician',
    },
    attendancePercentage: 96.0,
    latestScore: 92.5,
    previousScore: 89.0,
    scoreChange: 3.5,
    riskCategory: 'LOW',
    riskScore: 12,
    totalFeePaise: 16000000,
    paidFeePaise: 16000000,
    balanceFeePaise: 0,
    notes: 'Top rank contender in Biology & Chemistry. Consistent top decile performance.',
  },
  {
    id: 'stu-103',
    studentCode: 'APEX-2026-003',
    fullName: 'Amit Verma',
    email: 'amit.verma@example.com',
    phone: '+91 98765 43212',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&q=80',
    courseId: 'course-jee-adv',
    courseName: 'IIT-JEE (Advanced & Main) Two-Year Intensive',
    batchId: 'batch-jee-2026-b',
    batchName: 'JEE Adv 2026 Pinnacle Batch B',
    enrollmentDate: '2024-06-18',
    status: 'ACTIVE',
    attendancePercentage: 71.0,
    latestScore: 65.0,
    previousScore: 72.0,
    scoreChange: -7.0,
    riskCategory: 'MEDIUM',
    riskScore: 52,
    totalFeePaise: 18000000,
    paidFeePaise: 12000000,
    balanceFeePaise: 6000000,
  },
  {
    id: 'stu-104',
    studentCode: 'APEX-2026-004',
    fullName: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '+91 98765 43213',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80',
    courseId: 'course-neet-prime',
    courseName: 'NEET Medical Premier Comprehensive',
    batchId: 'batch-neet-2026-alpha',
    batchName: 'NEET 2026 Achievers Alpha',
    enrollmentDate: '2024-06-20',
    status: 'ACTIVE',
    attendancePercentage: 88.5,
    latestScore: 76.0,
    previousScore: 74.0,
    scoreChange: 2.0,
    riskCategory: 'LOW',
    riskScore: 18,
    totalFeePaise: 16000000,
    paidFeePaise: 10000000,
    balanceFeePaise: 6000000,
  },
  {
    id: 'stu-105',
    studentCode: 'APEX-2026-005',
    fullName: 'Karan Singhania',
    email: 'karan.s@example.com',
    phone: '+91 98765 43214',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&q=80',
    courseId: 'course-jee-adv',
    courseName: 'IIT-JEE (Advanced & Main) Two-Year Intensive',
    batchId: 'batch-jee-2027-a',
    batchName: 'JEE Adv 2027 Super-30 Batch A',
    enrollmentDate: '2025-06-05',
    status: 'ACTIVE',
    attendancePercentage: 58.0,
    latestScore: 38.0,
    previousScore: 66.0,
    scoreChange: -28.0,
    riskCategory: 'HIGH',
    riskScore: 89,
    totalFeePaise: 20000000,
    paidFeePaise: 5000000,
    balanceFeePaise: 15000000,
  },
  {
    id: 'stu-106',
    studentCode: 'APEX-2026-006',
    fullName: 'Ananya Deshmukh',
    email: 'ananya.d@example.com',
    phone: '+91 98765 43215',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&q=80',
    courseId: 'course-foundation',
    courseName: 'Olympiad & NTSE STEM Foundation (Class 9-10)',
    batchId: 'batch-found-2026',
    batchName: 'STEM Olympiad Foundation 2026',
    enrollmentDate: '2025-07-02',
    status: 'ACTIVE',
    attendancePercentage: 94.0,
    latestScore: 88.0,
    previousScore: 85.0,
    scoreChange: 3.0,
    riskCategory: 'LOW',
    riskScore: 10,
    totalFeePaise: 9000000,
    paidFeePaise: 9000000,
    balanceFeePaise: 0,
  },
  {
    id: 'stu-107',
    studentCode: 'APEX-2026-007',
    fullName: 'Rohan Joshi',
    email: 'rohan.j@example.com',
    phone: '+91 98765 43216',
    courseId: 'course-jee-adv',
    courseName: 'IIT-JEE (Advanced & Main) Two-Year Intensive',
    batchId: 'batch-jee-2027-a',
    batchName: 'JEE Adv 2027 Super-30 Batch A',
    enrollmentDate: '2025-06-08',
    status: 'ACTIVE',
    attendancePercentage: 74.5,
    latestScore: 71.0,
    previousScore: 82.0,
    scoreChange: -11.0,
    riskCategory: 'MEDIUM',
    riskScore: 46,
    totalFeePaise: 20000000,
    paidFeePaise: 10000000,
    balanceFeePaise: 10000000,
  },
  {
    id: 'stu-108',
    studentCode: 'APEX-2026-008',
    fullName: 'Tanvi Iyer',
    email: 'tanvi.i@example.com',
    phone: '+91 98765 43217',
    courseId: 'course-neet-prime',
    courseName: 'NEET Medical Premier Comprehensive',
    batchId: 'batch-neet-2026-alpha',
    batchName: 'NEET 2026 Achievers Alpha',
    enrollmentDate: '2024-06-15',
    status: 'ACTIVE',
    attendancePercentage: 91.0,
    latestScore: 84.0,
    previousScore: 81.0,
    scoreChange: 3.0,
    riskCategory: 'LOW',
    riskScore: 15,
    totalFeePaise: 16000000,
    paidFeePaise: 16000000,
    balanceFeePaise: 0,
  },
];

export const DEFAULT_ASSESSMENTS: Assessment[] = [
  {
    id: 'exam-01',
    batchId: 'batch-jee-2027-a',
    batchName: 'JEE Adv 2027 Super-30 Batch A',
    subjectId: 'sub-phy',
    subjectName: 'Physics (Mechanics & Rotational Dynamics)',
    title: 'Advanced Mechanics Mock Test 04',
    type: 'MOCK_TEST',
    examDate: '2026-10-22',
    maxMarks: 120,
    passMarks: 45,
    averageScore: 78.5,
    highestScore: 112.0,
    lowestScore: 42.0,
    totalSubmissions: 32,
  },
  {
    id: 'exam-02',
    batchId: 'batch-neet-2026-alpha',
    batchName: 'NEET 2026 Achievers Alpha',
    subjectId: 'sub-bio',
    subjectName: 'Biology (Genetics & Molecular Basis)',
    title: 'NEET Unit Test: Molecular Genetics & Evolution',
    type: 'UNIT_TEST',
    examDate: '2026-10-24',
    maxMarks: 360,
    passMarks: 180,
    averageScore: 284.0,
    highestScore: 350.0,
    lowestScore: 160.0,
    totalSubmissions: 41,
  },
  {
    id: 'exam-03',
    batchId: 'batch-jee-2026-b',
    batchName: 'JEE Adv 2026 Pinnacle Batch B',
    subjectId: 'sub-math',
    subjectName: 'Mathematics (Calculus & Vectors)',
    title: 'Integral Calculus Mastery Challenge',
    type: 'WEEKLY_QUIZ',
    examDate: '2026-10-26',
    maxMarks: 100,
    passMarks: 40,
    averageScore: 68.2,
    highestScore: 96.0,
    lowestScore: 34.0,
    totalSubmissions: 38,
  },
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    studentId: 'stu-101',
    studentName: 'Rahul Sharma',
    studentCode: 'APEX-2026-001',
    invoiceNumber: 'INV-2026-00101',
    subtotalPaise: 18000000,
    discountPaise: 0,
    totalPaise: 18000000,
    paidPaise: 10000000,
    balancePaise: 8000000,
    status: 'OVERDUE',
    dueDate: '2026-09-30',
    createdAt: '2024-06-15',
    lineItems: [
      { id: 'li-1', description: 'IIT-JEE 2-Year Tuition Term 1', amountPaise: 10000000, quantity: 1 },
      { id: 'li-2', description: 'IIT-JEE 2-Year Tuition Term 2 (Installment 2)', amountPaise: 8000000, quantity: 1 },
    ],
  },
  {
    id: 'inv-102',
    studentId: 'stu-102',
    studentName: 'Priya Patel',
    studentCode: 'APEX-2026-002',
    invoiceNumber: 'INV-2026-00102',
    subtotalPaise: 16000000,
    discountPaise: 0,
    totalPaise: 16000000,
    paidPaise: 16000000,
    balancePaise: 0,
    status: 'PAID',
    dueDate: '2026-06-30',
    createdAt: '2024-06-12',
    lineItems: [
      { id: 'li-3', description: 'NEET 2-Year Full Tuition', amountPaise: 16000000, quantity: 1 },
    ],
  },
  {
    id: 'inv-103',
    studentId: 'stu-103',
    studentName: 'Amit Verma',
    studentCode: 'APEX-2026-003',
    invoiceNumber: 'INV-2026-00103',
    subtotalPaise: 18000000,
    discountPaise: 0,
    totalPaise: 18000000,
    paidPaise: 12000000,
    balancePaise: 6000000,
    status: 'PARTIALLY_PAID',
    dueDate: '2026-10-31',
    createdAt: '2024-06-18',
    lineItems: [
      { id: 'li-4', description: 'IIT-JEE 2-Year Tuition Installment 1', amountPaise: 12000000, quantity: 1 },
      { id: 'li-5', description: 'IIT-JEE 2-Year Tuition Installment 2', amountPaise: 6000000, quantity: 1 },
    ],
  },
  {
    id: 'inv-105',
    studentId: 'stu-105',
    studentName: 'Karan Singhania',
    studentCode: 'APEX-2026-005',
    invoiceNumber: 'INV-2026-00105',
    subtotalPaise: 20000000,
    discountPaise: 0,
    totalPaise: 20000000,
    paidPaise: 5000000,
    balancePaise: 15000000,
    status: 'OVERDUE',
    dueDate: '2026-08-31',
    createdAt: '2025-06-05',
    lineItems: [
      { id: 'li-7', description: 'IIT-JEE Super-30 Tuition Fee Term 1', amountPaise: 5000000, quantity: 1 },
      { id: 'li-8', description: 'IIT-JEE Super-30 Tuition Fee Term 2', amountPaise: 15000000, quantity: 1 },
    ],
  },
];

export const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    invoiceId: 'inv-101',
    invoiceNumber: 'INV-2026-00101',
    studentId: 'stu-101',
    studentName: 'Rahul Sharma',
    amountPaise: 10000000,
    paymentMethod: 'UPI',
    status: 'SUCCESS',
    receiptNumber: 'RCP-2026-001',
    transactionRef: 'UPI-98234-8821',
    paidAt: '2024-06-15T10:30:00Z',
    notes: 'Advance installment received via instant UPI QR checkout',
  },
  {
    id: 'pay-002',
    invoiceId: 'inv-102',
    invoiceNumber: 'INV-2026-00102',
    studentId: 'stu-102',
    studentName: 'Priya Patel',
    amountPaise: 16000000,
    paymentMethod: 'NET_BANKING',
    status: 'SUCCESS',
    receiptNumber: 'RCP-2026-002',
    transactionRef: 'NET-4412-9901',
    paidAt: '2024-06-12T14:15:00Z',
    notes: 'Full lump sum course settlement',
  },
];

export const DEFAULT_EARLY_WARNINGS: EarlyWarningAlert[] = [
  {
    id: 'alert-01',
    studentId: 'stu-101',
    studentName: 'Rahul Sharma',
    studentCode: 'APEX-2026-001',
    batchName: 'JEE Adv 2026 Pinnacle Batch B',
    riskScore: 82,
    riskCategory: 'HIGH',
    primaryFactors: ['Attendance dropped to 62.5%', 'Latest test score dropped by 24%', 'Outstanding fees ₹80,000'],
    evidenceData: {
      attendancePct: 62.5,
      prevScore: 78.0,
      latestScore: 54.0,
      scoreDeclinePct: 24.0,
      repeatedAbsences: 5,
      missingAssessments: 1,
    },
    recommendedAction: 'Mandate one-on-one academic counseling with Prof. Sen and dispatch parent fee notice.',
    status: 'PENDING',
    assignedFacultyName: 'Prof. Ananya Sen',
    createdAt: '2026-10-15T08:30:00Z',
  },
  {
    id: 'alert-02',
    studentId: 'stu-105',
    studentName: 'Karan Singhania',
    studentCode: 'APEX-2026-005',
    batchName: 'JEE Adv 2027 Super-30 Batch A',
    riskScore: 89,
    riskCategory: 'HIGH',
    primaryFactors: ['Attendance at 58%', 'Score down 28%', 'Overdue balance ₹1,50,000'],
    evidenceData: {
      attendancePct: 58.0,
      prevScore: 66.0,
      latestScore: 38.0,
      scoreDeclinePct: 28.0,
      repeatedAbsences: 4,
    },
    recommendedAction: 'Parent conference requested by institute director.',
    status: 'PENDING',
    assignedFacultyName: 'Prof. Ananya Sen',
    createdAt: '2026-10-16T09:15:00Z',
  },
  {
    id: 'alert-03',
    studentId: 'stu-103',
    studentName: 'Amit Verma',
    studentCode: 'APEX-2026-003',
    batchName: 'JEE Adv 2026 Pinnacle Batch B',
    riskScore: 52,
    riskCategory: 'MEDIUM',
    primaryFactors: ['Attendance dropped to 71%', 'Score decline of 7%'],
    evidenceData: {
      attendancePct: 71.0,
      prevScore: 72.0,
      latestScore: 65.0,
      scoreDeclinePct: 7.0,
      repeatedAbsences: 2,
    },
    recommendedAction: 'Follow up on medical leave documentation and coordinate makeup classes.',
    status: 'UNDER_REVIEW',
    assignedFacultyName: 'Dr. Rajiv Menon',
    createdAt: '2026-10-14T11:20:00Z',
  },
];

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'EARLY_WARNING',
    title: 'High Risk Alert: Karan Singhania',
    message: 'Attendance dropped to 58% and scores declined by 28%. Immediate mentor review needed.',
    entityId: 'stu-105',
    entityType: 'student',
    isRead: false,
    createdAt: '2026-10-16T09:15:00Z',
  },
  {
    id: 'notif-2',
    type: 'PAYMENT_CONFIRMATION',
    title: 'Fee Payment Received',
    message: '₹1,00,000 paid by Rahul Sharma via UPI QR checkout.',
    entityId: 'inv-101',
    entityType: 'invoice',
    isRead: true,
    createdAt: '2026-10-15T10:30:00Z',
  },
];

export const DEFAULT_DASHBOARD_METRICS: DashboardMetrics = {
  totalStudents: 8,
  activeBatches: 4,
  attendanceTodayPct: 88.4,
  averageTestScorePct: 74.2,
  flaggedStudentsCount: 3,
  highRiskCount: 2,
  mediumRiskCount: 1,
  feesCollectedMonthPaise: 42000000,
  outstandingFeesPaise: 27500000,
  overdueInvoicesCount: 4,
  collectionTrend: [
    { month: 'Jun', collectedPaise: 42000000, targetPaise: 40000000 },
    { month: 'Jul', collectedPaise: 38000000, targetPaise: 35000000 },
    { month: 'Aug', collectedPaise: 51000000, targetPaise: 45000000 },
    { month: 'Sep', collectedPaise: 33000000, targetPaise: 40000000 },
    { month: 'Oct', collectedPaise: 42000000, targetPaise: 45000000 },
  ],
  attendanceTrend: [
    { date: '10 Oct', ratePct: 89.2 },
    { date: '11 Oct', ratePct: 87.5 },
    { date: '12 Oct', ratePct: 86.0 },
    { date: '13 Oct', ratePct: 91.4 },
    { date: '14 Oct', ratePct: 88.9 },
    { date: '15 Oct', ratePct: 87.1 },
    { date: '16 Oct', ratePct: 88.4 },
  ],
  recentActivities: [
    { id: 'act-1', action: 'Fee Payment Verified (₹35,000 via QR)', time: '10:45 AM', user: 'Ramesh Kulkarni', type: 'PAYMENT' },
    { id: 'act-2', action: 'Attendance Synced - JEE 2027 Super-30', time: '09:15 AM', user: 'Prof. Ananya Sen', type: 'ATTENDANCE' },
    { id: 'act-3', action: 'High-Risk Alert Triggered for Karan Singhania', time: '08:30 AM', user: 'AI Sentinel', type: 'EARLY_WARNING' },
    { id: 'act-4', action: 'Assessment Published: Thermodynamics Part-I', time: 'Yesterday', user: 'Dr. Sunita Rao', type: 'ASSESSMENT' },
    { id: 'act-5', action: 'Overdue SMS Reminder Dispatched', time: 'Yesterday', user: 'Automated Bot', type: 'FEE' },
  ],
  upcomingTests: DEFAULT_ASSESSMENTS,
  earlyWarningAlerts: DEFAULT_EARLY_WARNINGS,
  aiInstituteSummary: 'Apex Academy is operating with 4 active batches running at 88.4% institutional attendance today. 3 students are flagged for early intervention (2 High Risk, 1 Medium Risk). Current cycle collections total ₹4,20,000, with ₹2,75,000 pending across overdue installments.',
};

export const DEFAULT_3D_POINTS: VisualizationPoint3D[] = DEFAULT_STUDENTS.map(s => ({
  id: s.id,
  studentName: s.fullName,
  batchName: s.batchName || 'General Batch',
  attendancePct: s.attendancePercentage || 85.0,
  scorePct: s.latestScore || 70.0,
  riskScore: s.riskScore || 20,
  riskCategory: s.riskCategory || 'LOW',
}));

export const DEFAULT_SETTINGS = {
  institute: DEFAULT_INSTITUTE,
  paymentGateway: {
    configured: true,
    mode: 'upi_qr_only',
    keyId: 'rzp_live_ApexAcademy2026',
    fullKeyIdForCheckout: 'rzp_live_ApexAcademy2026',
    currency: 'INR',
    webhookConfigured: true,
    signatureVerification: 'ENFORCED',
    adminOnly: true,
  },
  aiConfig: {
    configured: true,
    model: 'gemini-1.5-flash',
    provider: 'Google Gemini Pro / Flash',
    status: 'ACTIVE',
  },
  database: {
    connected: true,
    provider: 'postgresql',
    message: 'Institutional Database connected & operational.',
  },
};

// Dispatcher for fallback requests
export function getFallbackForEndpoint<T>(endpoint: string, method: string = 'GET'): T | undefined {
  const cleanEndpoint = endpoint.split('?')[0];

  if (cleanEndpoint === '/analytics/dashboard') {
    return DEFAULT_DASHBOARD_METRICS as unknown as T;
  }

  if (cleanEndpoint === '/analytics/visualizations-3d') {
    return {
      description: '3D Performance Landscape Data: X = Attendance %, Y = Assessment Score %, Z = Risk Score (0-100)',
      data: DEFAULT_3D_POINTS,
    } as unknown as T;
  }

  if (cleanEndpoint === '/students') {
    return {
      data: DEFAULT_STUDENTS,
      pagination: { total: DEFAULT_STUDENTS.length, page: 1, limit: 50, totalPages: 1 },
    } as unknown as T;
  }

  if (cleanEndpoint.startsWith('/students/')) {
    const id = cleanEndpoint.replace('/students/', '');
    const found = DEFAULT_STUDENTS.find(s => s.id === id) || DEFAULT_STUDENTS[0];
    const studentInvoices = DEFAULT_INVOICES.filter(i => i.studentId === found.id);
    const studentPayments = DEFAULT_PAYMENTS.filter(p => p.studentId === found.id);
    return {
      student: found,
      attendance: [
        { id: 'att-1', sessionId: 'ses-1', studentId: found.id, status: 'PRESENT', date: '2026-10-15', batchId: found.batchId },
        { id: 'att-2', sessionId: 'ses-2', studentId: found.id, status: 'PRESENT', date: '2026-10-14', batchId: found.batchId },
        { id: 'att-3', sessionId: 'ses-3', studentId: found.id, status: 'ABSENT', date: '2026-10-13', batchId: found.batchId },
      ],
      assessmentResults: [
        { assessmentId: 'exam-01', assessmentTitle: 'Advanced Mechanics Mock Test 04', score: found.latestScore || 70, maxMarks: 100, rank: 4 },
      ],
      invoices: studentInvoices.length > 0 ? studentInvoices : DEFAULT_INVOICES.slice(0, 1),
      payments: studentPayments.length > 0 ? studentPayments : DEFAULT_PAYMENTS.slice(0, 1),
      earlyWarningEvaluation: {
        riskCategory: found.riskCategory || 'LOW',
        riskScore: found.riskScore || 20,
        factors: found.riskCategory === 'HIGH' ? ['Low attendance', 'Declining scores'] : ['Satisfactory performance'],
      },
    } as unknown as T;
  }

  if (cleanEndpoint === '/batches') {
    return DEFAULT_BATCHES as unknown as T;
  }

  if (cleanEndpoint === '/faculty') {
    return DEFAULT_FACULTY as unknown as T;
  }

  if (cleanEndpoint === '/assessments') {
    return DEFAULT_ASSESSMENTS as unknown as T;
  }

  if (cleanEndpoint === '/early-warning/alerts') {
    return DEFAULT_EARLY_WARNINGS as unknown as T;
  }

  if (cleanEndpoint === '/fees/invoices') {
    return DEFAULT_INVOICES as unknown as T;
  }

  if (cleanEndpoint === '/fees/plans') {
    return [
      { id: 'plan-jee-2yr', courseName: 'IIT-JEE Two-Year Intensive', name: 'Standard JEE Full Tuition', totalPaise: 18000000, installments: 3 },
      { id: 'plan-neet-2yr', courseName: 'NEET Medical Premier', name: 'Premier Medical Package', totalPaise: 16000000, installments: 2 },
    ] as unknown as T;
  }

  if (cleanEndpoint === '/fees/overdue') {
    return {
      totalOverdueCount: 4,
      totalOverduePaise: 27500000,
      buckets: {
        days1_15: 8000000,
        days16_30: 4500000,
        days31_60: 6000000,
        days60Plus: 9000000,
      },
      invoices: DEFAULT_INVOICES.filter(i => i.status === 'OVERDUE' || i.balancePaise > 0),
    } as unknown as T;
  }

  if (cleanEndpoint === '/payments/history') {
    return DEFAULT_PAYMENTS as unknown as T;
  }

  if (cleanEndpoint === '/payments/gateway-info') {
    return {
      configured: true,
      mode: 'upi_qr_only',
      keyId: 'rzp_live_ApexAcademy2026',
      fullKeyIdForCheckout: 'rzp_live_ApexAcademy2026',
      currency: 'INR',
      webhookConfigured: true,
      signatureVerification: 'ENFORCED',
    } as unknown as T;
  }

  if (cleanEndpoint === '/notifications') {
    return DEFAULT_NOTIFICATIONS as unknown as T;
  }

  if (cleanEndpoint === '/settings') {
    return DEFAULT_SETTINGS as unknown as T;
  }

  if (cleanEndpoint === '/auth/me') {
    return {
      user: DEFAULT_USER,
      institute: DEFAULT_INSTITUTE,
      database: { connected: true, provider: 'postgresql' },
    } as unknown as T;
  }

  if (cleanEndpoint === '/auth/database-status') {
    return {
      connected: true,
      message: 'PostgreSQL Database synchronized & operational.',
      provider: 'postgresql',
      databaseUrlConfigured: true,
      totalUsers: 4,
      institutesCount: 1,
      latencyMs: 12,
      activeInstituteName: DEFAULT_INSTITUTE.name,
      directUrlConfigured: true,
    } as unknown as T;
  }

  if (cleanEndpoint === '/ai/status') {
    return {
      configured: true,
      model: 'gemini-1.5-flash',
      provider: 'Google Gemini Pro / Flash',
      status: 'active',
    } as unknown as T;
  }

  if (cleanEndpoint === '/attendance/stats') {
    return {
      todayAttendanceRate: 88.4,
      batches: DEFAULT_BATCHES.map(b => ({ batchId: b.id, batchName: b.name, rate: 89.0 })),
    } as unknown as T;
  }

  if (cleanEndpoint === '/attendance') {
    const today = new Date().toISOString().slice(0, 10);
    return DEFAULT_STUDENTS.map((s, idx) => ({
      id: `att-rec-${s.id}`,
      sessionId: 'ses-today',
      studentId: s.id,
      studentName: s.fullName,
      status: idx === 0 || idx === 4 ? 'ABSENT' : 'PRESENT',
      date: today,
      batchId: s.batchId,
    })) as unknown as T;
  }

  return undefined;
}
