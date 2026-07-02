import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { bucketService } from '@/services/bucket.service';
import { attendanceService } from '@/services/attendance.service';
import { reportService } from '@/services/report.service';
import {
  Users, CheckSquare, Clock, UserCheck, UserX, AlertTriangle,
  FolderKanban, TrendingUp, ArrowRight, CalendarDays
} from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

export default function Dashboard() {
  const { employee } = useOutletContext();
  const [stats, setStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentBuckets, setRecentBuckets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const isAdmin = employee?.role === 'super_admin' || employee?.role === 'company_admin' || employee?.role === 'manager';

  useEffect(() => {
    const load = async () => {
      const [tasks, buckets, attendance, logs] = await Promise.all([
        taskService.getTasks('-created_date', 50),
        bucketService.getBuckets('-created_date', 10),
        attendanceService.filterAttendance({ date: today }),
        reportService.getActivityLogs(8),
      ]);

      const todayTasks = tasks.filter(t => t.due_date === today);
      const pending = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
      const completed = tasks.filter(t => t.status === 'completed');
      const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'completed' && t.status !== 'archived');
      const present = attendance.filter(a => a.status === 'present' || a.status === 'wfh');
      const absent = attendance.filter(a => a.status === 'absent');
      const late = attendance.filter(a => a.status === 'late');

      setStats({
        todayTasks: todayTasks.length,
        pending: pending.length,
        completed: completed.length,
        overdue: overdue.length,
        present: present.length,
        absent: absent.length,
        late: late.length,
        totalBuckets: buckets.length,
      });
      setRecentTasks(tasks.slice(0, 6));
      setRecentBuckets(buckets.slice(0, 4));
      setActivities(logs);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {employee?.full_name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening today — {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && (
          <>
            <StatCard icon={UserCheck} label="Present Today" value={stats.present} color="green" />
            <StatCard icon={UserX} label="Absent Today" value={stats.absent} color="red" />
            <StatCard icon={Clock} label="Late Today" value={stats.late} color="amber" />
          </>
        )}
        <StatCard icon={CalendarDays} label="Today's Tasks" value={stats.todayTasks} color="blue" />
        <StatCard icon={CheckSquare} label="Pending Tasks" value={stats.pending} color="amber" />
        <StatCard icon={TrendingUp} label="Completed" value={stats.completed} color="green" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="red" />
        <StatCard icon={FolderKanban} label="Active Buckets" value={stats.totalBuckets} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTasks.length === 0 ? (
              <p className="p-5 text-sm text-slate-500 text-center">No tasks yet</p>
            ) : (
              recentTasks.map(task => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.bucket_name && <span>{task.bucket_name} · </span>}
                      {task.assigned_to_name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <StatusBadge status={task.priority} type="priority" />
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Buckets */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Buckets</h2>
              <Link to="/buckets" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentBuckets.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 text-center">No buckets yet</p>
              ) : (
                recentBuckets.map(b => (
                  <Link key={b.id} to={`/buckets/${b.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color || '#3B82F6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{b.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{b.status}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 text-center">No activity yet</p>
              ) : (
                activities.map(a => (
                  <div key={a.id} className="p-4">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{a.user_name || 'System'}</span>{' '}
                      {a.details || a.action}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(a.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}