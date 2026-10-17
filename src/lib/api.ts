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

import { getFallbackForEndpoint } from './fallbackData';

// Support relative API paths on Vercel/localhost, and connect to live Vercel backend when hosted on static GitHub Pages
const API_BASE = (import.meta as any).env?.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
    ? 'https://ai-coaching-institute-intelligence.vercel.app/api/v1'
    : '/api/v1'
);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('edutrack_auth_token');
  const userStr = localStorage.getItem('edutrack_auth_user');
  let currentRole = 'ADMIN';
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      if (parsed.role) currentRole = parsed.role;
    } catch (_) {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': currentRole,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[EduTrack API] Request to ${endpoint} failed (${err.name === 'AbortError' ? 'timed out after 4s' : err.message || err}). Engaging instant institutional fallback data.`);
    const fallback = getFallbackForEndpoint<T>(endpoint, options.method);
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
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

  // AI Assistant (Google Gemini 3.8 Flash & Grounded Data Engine)
  askAIChat: (
    message: string,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[],
    studentId?: string
  ) =>
    request<{
      reply: string;
      isGrounded: boolean;
      source: string;
      evidence?: any[];
      suggestions?: string[];
      fallbackUsed?: boolean;
      timestamp?: string;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory, studentId }),
    }),
  getAIStatus: () =>
    request<{
      configured: boolean;
      model: string;
      provider: string;
      status: string;
    }>('/ai/status'),
  getAISuggestions: () =>
    request<{ suggestions: string[] }>('/ai/suggestions'),
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
  getStudentAIInsight: (studentId: string) =>
    request<{
      studentId: string;
      studentName: string;
      studentCode: string;
      batchName: string;
      diagnosis: string;
      metrics: any;
      recommendedInterventions: string[];
      parentSummary: string;
    }>('/ai/student-insight', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
  summarizeAIDomain: (domain: 'academic' | 'attendance' | 'fees' | 'risk' | 'executive') =>
    request<{ domain: string; summary: string; keyMetrics: any; evidence: any[]; timestamp: string }>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    }),
  configureAI: (payload: { apiKey?: string; model?: string }) =>
    request<{ message: string; configured: boolean; model: string }>('/ai/configure', {
      method: 'POST',
      body: JSON.stringify(payload),
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
