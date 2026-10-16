import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { AttendancePage } from './pages/AttendancePage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { PerformancePage } from './pages/PerformancePage';
import { Visualizations3DPage } from './pages/Visualizations3DPage';
import { BatchesPage } from './pages/BatchesPage';
import { FacultyPage } from './pages/FacultyPage';
import { FeePlansPage } from './pages/FeePlansPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { OverdueFeesPage } from './pages/OverdueFeesPage';
import { EarlyWarningPage } from './pages/EarlyWarningPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Application Workspace Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/visualizations-3d" element={<Visualizations3DPage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/fees/plans" element={<FeePlansPage />} />
          <Route path="/fees/payments" element={<PaymentsPage />} />
          <Route path="/fees/overdue" element={<OverdueFeesPage />} />
          <Route path="/early-warning" element={<EarlyWarningPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
