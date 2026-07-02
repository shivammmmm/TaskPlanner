import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { settingsService } from '@/services/settings.service';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

const typeIcons = {
  task_assigned: '📋', task_completed: '✅', attendance: '🕐',
  notice: '📢', meeting: '🎥', system: '⚙️', alert: '⚠️'
};

export default function Notifications() {
  const { employee } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (employee) {
      setNotifications(await settingsService.getNotifications(employee.user_id, '-created_date', 100));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [employee]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await settingsService.updateNotification(n.id, { is_read: true });
    }
    loadData();
  };

  const markRead = async (id) => {
    await settingsService.updateNotification(id, { is_read: true });
    loadData();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read
            </Button>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border animate-pulse p-5"><div className="h-4 bg-slate-200 rounded w-3/4" /></div>)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left bg-white rounded-xl border border-slate-200 p-4 transition hover:shadow-sm ${!n.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{typeIcons[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{format(new Date(n.created_date), 'MMM d, h:mm a')}</p>
                </div>
                {!n.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}