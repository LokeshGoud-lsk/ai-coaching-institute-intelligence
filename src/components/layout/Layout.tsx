import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIChatDrawer } from '../ai/AIChatDrawer';
import { UserRole } from '../../types';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('edutrack_auth_token');
    navigate('/auth/login');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Optional toast notification or header update
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          role={role}
          unreadNotificationsCount={2}
          openAlertsCount={3}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          role={role}
          unreadNotificationsCount={2}
          openAlertsCount={3}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentRole={role}
          onRoleChange={handleRoleChange}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          unreadCount={2}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet context={{ currentRole: role }} />
        </main>
      </div>

      {/* Floating AI Chat Assistant Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
};
