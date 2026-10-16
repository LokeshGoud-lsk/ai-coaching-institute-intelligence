import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, CreditCard, CalendarCheck, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { NotificationItem } from '../types';
import { Button } from '../components/common/Button';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotifications();
      setNotifications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter(n => (filter === 'unread' ? !n.isRead : true));

  const getIcon = (type: string) => {
    switch (type) {
      case 'EARLY_WARNING':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'PAYMENT_CONFIRMATION':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'ATTENDANCE_ALERT':
        return <CalendarCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Institutional Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time alerts for low attendance, score decline, overdue fees, and payment confirmations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filter === 'unread' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-card text-xs">
            No notifications matching current filter.
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                item.isRead
                  ? 'bg-slate-900/40 border-white/5 text-slate-400'
                  : 'bg-slate-900/90 border-brand-500/30 text-white shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {new Date(item.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {!item.isRead && (
                <button
                  onClick={() => handleMarkAsRead(item.id)}
                  title="Mark read"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
