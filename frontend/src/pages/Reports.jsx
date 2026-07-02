import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { attendanceService } from '@/services/attendance.service';
import { timesheetService } from '@/services/timesheet.service';
import { BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const { employee } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, a, ts] = await Promise.all([
        taskService.getTasks('-created_date', 500),
        attendanceService.getAttendance('-date', 500),
        timesheetService.getTimesheets('-date', 500),
      ]);
      setTasks(t); setAttendance(a); setTimesheets(ts); setLoading(false);
    };
    load();
  }, []);

  // Task status distribution
  const taskStatusData = ['todo', 'in_progress', 'in_review', 'completed', 'archived'].map(s => ({
    name: s.replace(/_/g, ' '), value: tasks.filter(t => t.status === s).length
  })).filter(d => d.value > 0);

  // Task priority distribution
  const taskPriorityData = ['low', 'medium', 'high', 'urgent'].map(p => ({
    name: p, value: tasks.filter(t => t.priority === p).length
  })).filter(d => d.value > 0);

  // Attendance status distribution
  const attendanceData = ['present', 'absent', 'late', 'half_day', 'wfh', 'leave'].map(s => ({
    name: s.replace(/_/g, ' '), value: attendance.filter(a => a.status === s).length
  })).filter(d => d.value > 0);

  // Timesheet hours by day (last 7 days)
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayHours = timesheets.filter(t => t.date === dateStr).reduce((sum, t) => sum + (t.hours || 0), 0);
    last7.push({ name: dateStr.slice(5), hours: Math.round(dayHours * 10) / 10 });
  }

  // Tasks per bucket
  const bucketCounts = {};
  tasks.forEach(t => { if (t.bucket_name) bucketCounts[t.bucket_name] = (bucketCounts[t.bucket_name] || 0) + 1; });
  const bucketData = Object.entries(bucketCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  if (loading) return <div className="space-y-6"><PageHeader title="Reports" /><div className="bg-white rounded-xl border animate-pulse p-16"><div className="h-48 bg-slate-200 rounded" /></div></div>;

  return (
    <div>
      <PageHeader title="Reports" description="Analytics and performance dashboards" />

      <Tabs defaultValue="tasks">
        <TabsList className="bg-white border mb-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="buckets">Buckets</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Task Status Distribution</h3>
              {taskStatusData.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No data</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart><Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {taskStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Task Priority Distribution</h3>
              {taskPriorityData.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No data</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={taskPriorityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Attendance Overview</h3>
            {attendanceData.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No data</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart><Pie data={attendanceData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timesheets">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Hours Logged (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} /></LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="buckets">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Tasks per Bucket</h3>
            {bucketData.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No data</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bucketData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} /><Tooltip /><Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} /></BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}