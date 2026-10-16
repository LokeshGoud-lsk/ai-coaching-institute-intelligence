// Client API abstraction layer connecting frontend to backend REST endpoints under /api/v1
// Gracefully handles network resilience, authentication tokens, and JSON payloads.

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
  AttendanceRecord
} from '../types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('edutrack_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password?: string, role?: string) =>
    request<{
      token: string;
      user: UserProfile;
      institute: Institute;
      database?: { connected: boolean; authenticatedViaPostgres: boolean; provider: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  getMe: () =>
    request<{
      user: UserProfile;
      institute: Institute;
      database?: { connected: boolean; provider: string };
    }>('/auth/me'),
  register: (data: {
    instituteName: string;
    adminName: string;
    adminEmail: string;
    password?: string;
    phoneNumber?: string;
  }) =>
    request<{
      message: string;
      token: string;
      user: UserProfile;
      institute: Institute;
      database?: { connected: boolean; savedToPostgres: boolean; provider: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDatabaseStatus: () =>
    request<{
      connected: boolean;
      message: string;
      provider: string;
      databaseUrlConfigured: boolean;
      totalUsers: number;
      institutesCount: number;
      latencyMs: number;
      activeInstituteName: string;
      directUrlConfigured: boolean;
    }>('/auth/database-status'),
  connectDatabase: (databaseUrl: string) =>
    request<{
      success: boolean;
      message: string;
      connected: boolean;
      provider: string;
    }>('/auth/connect-database', {
      method: 'POST',
      body: JSON.stringify({ databaseUrl }),
    }),

  // Dashboard & Analytics
  getDashboard: () => request<DashboardMetrics>('/analytics/dashboard'),
  get3DVisualizations: () => request<{ description: string; data: VisualizationPoint3D[] }>('/analytics/visualizations-3d'),

  // Students
  getStudents: (params?: { search?: string; batchId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return request<{ data: Student[]; pagination: any }>(`/students?${query.toString()}`);
  },
  getStudentById: (id: string) => request<{
    student: Student;
    attendance: AttendanceRecord[];
    assessmentResults: any[];
    invoices: Invoice[];
    payments: Payment[];
    earlyWarningEvaluation: any;
  }>(`/students/${id}`),
  createStudent: (student: Partial<Student>) =>
    request<Student>('/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id: string, updates: Partial<Student>) =>
    request<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  archiveStudent: (id: string) => request<{ message: string; student: Student }>(`/students/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params?: { batchId?: string; date?: string }) => {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.date) query.set('date', params.date);
    return request<AttendanceRecord[]>(`/attendance?${query.toString()}`);
  },
  markAttendance: (batchId: string, date: string, records: { studentId: string; status: string; remarks?: string }[]) =>
    request<{ message: string; records: AttendanceRecord[] }>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ batchId, date, records }),
    }),
  getAttendanceStats: () => request<{ todayAttendanceRate: number; batches: any[] }>('/attendance/stats'),

  // Assessments
  getAssessments: (batchId?: string) =>
    request<Assessment[]>(`/assessments${batchId ? `?batchId=${batchId}` : ''}`),
  createAssessment: (assessment: Partial<Assessment>) =>
    request<Assessment>('/assessments', { method: 'POST', body: JSON.stringify(assessment) }),
  getAssessmentResults: (id: string) =>
    request<{ assessment: Assessment; results: any[] }>(`/assessments/${id}/results`),
  saveAssessmentResults: (id: string, results: any[]) =>
    request<{ message: string }>(`/assessments/${id}/results`, {
      method: 'POST',
      body: JSON.stringify({ results }),
    }),

  // Early Warning
  getEarlyWarningAlerts: (params?: { category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    return request<EarlyWarningAlert[]>(`/early-warning/alerts?${query.toString()}`);
  },
  evaluateAllRisks: () =>
    request<{ message: string; totalEvaluated: number; activeAlerts: EarlyWarningAlert[] }>('/early-warning/evaluate-all', {
      method: 'POST',
    }),
  reviewAlert: (id: string, payload: { status: string; reviewNotes?: string; assignedFacultyId?: string }) =>
    request<EarlyWarningAlert>(`/early-warning/alerts/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Fees & Invoices
  getFeePlans: () => request<any[]>('/fees/plans'),
  createFeePlan: (plan: any) => request<any>('/fees/plans', { method: 'POST', body: JSON.stringify(plan) }),
  getInvoices: (params?: { studentId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.status) query.set('status', params.status);
    return request<Invoice[]>(`/fees/invoices?${query.toString()}`);
  },
  createInvoice: (invoiceData: any) =>
    request<Invoice>('/fees/invoices', { method: 'POST', body: JSON.stringify(invoiceData) }),
  getOverdueSummary: () =>
    request<{ totalOverdueCount: number; totalOverduePaise: number; buckets: any; invoices: Invoice[] }>('/fees/overdue'),

  // Payments & Razorpay
  createPaymentOrder: (invoiceId: string, amountPaise: number) =>
    request<{
      orderId: string;
      amountPaise: number;
      currency: string;
      keyId: string;
      invoiceNumber: string;
      studentName: string;
      isTestMode: boolean;
      hasRealCredentials: boolean;
    }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ invoiceId, amountPaise }),
    }),
  verifyPaymentSignature: (payload: {
    invoiceId: string;
    amountPaise: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentMethod?: string;
  }) =>
    request<{ message: string; payment: Payment; updatedInvoice: Invoice }>('/payments/verify-signature', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPaymentHistory: () => request<Payment[]>('/payments/history'),
  getGatewayInfo: () =>
    request<{
      configured: boolean;
      mode: string;
      keyId: string | null;
      fullKeyIdForCheckout: string;
      currency: string;
      webhookConfigured: boolean;
      signatureVerification: string;
    }>('/payments/gateway-info'),
  configurePaymentGateway: (payload: { keyId: string; keySecret: string; webhookSecret?: string }) =>
    request<{ message: string; configured: boolean; mode: string }>('/payments/configure', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  testGatewayConnection: () =>
    request<{ success: boolean; message: string; count?: number }>('/payments/test-connection', {
      method: 'POST',
    }),

  // AI Assistant (Gemini)
  askAIChat: (message: string) =>
    request<{ reply: string; isGrounded: boolean; source: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  generateAIReport: (month?: string) =>
    request<any>('/ai/generate-report', {
      method: 'POST',
      body: JSON.stringify({ month }),
    }),
  draftAIMessage: (studentId: string, type: 'ATTENDANCE_DROP' | 'FEE_REMINDER' | 'ACADEMIC_SUPPORT') =>
    request<{ recipient: string; studentName: string; subject: string; body: string; requiresHumanReview: boolean }>('/ai/draft-message', {
      method: 'POST',
      body: JSON.stringify({ studentId, type }),
    }),

  // Batches & Faculty
  getBatches: () => request<Batch[]>('/batches'),
  createBatch: (batch: Partial<Batch>) =>
    request<Batch>('/batches', { method: 'POST', body: JSON.stringify(batch) }),
  getFaculty: () => request<Faculty[]>('/faculty'),
  createFaculty: (faculty: Partial<Faculty>) =>
    request<Faculty>('/faculty', { method: 'POST', body: JSON.stringify(faculty) }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/mark-all-read', { method: 'PUT' }),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (settings: any) =>
    request<{ message: string; institute: Institute }>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};
