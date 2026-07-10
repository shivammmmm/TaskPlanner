import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { attendanceService } from '@/services/attendance.service';
import { authService } from '@/services/auth.service';
import { UserCheck, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import StatCard from '@/components/shared/StatCard';

export default function AttendancePage() {
  const { employee } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    employee_id: '', date: new Date().toISOString().split('T')[0],
    status: 'present', clock_in: '', clock_out: '', notes: ''
  });

  const isAdmin = employee?.role === 'super_admin' || employee?.role === 'company_admin' || employee?.role === 'manager';

  const loadData = async () => {
    const [a, e] = await Promise.all([
      attendanceService.getAttendance('-date', 200),
      authService.filterEmployees({ status: 'active' }),
    ]);
    setRecords(a); setEmployees(e); setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const requestedStatus = new URLSearchParams(window.location.search).get('status');
    if (requestedStatus) setStatusFilter(requestedStatus);
  }, []);

  const filtered = records.filter(r => {
    if (dateFilter && r.date !== dateFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const todayRecords = records.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const present = todayRecords.filter(r => r.status === 'present' || r.status === 'wfh').length;
  const absent = todayRecords.filter(r => r.status === 'absent').length;
  const late = todayRecords.filter(r => r.status === 'late').length;

  const handleSave = async () => {
    const emp = employees.find(e => e.user_id === form.employee_id || e.id === form.employee_id);
    const clockIn = form.clock_in || undefined;
    const clockOut = form.clock_out || undefined;
    let workingHours = 0;
    if (clockIn && clockOut) {
      const inParts = clockIn.split(':'); const outParts = clockOut.split(':');
      workingHours = Math.round(((parseInt(outParts[0]) * 60 + parseInt(outParts[1])) - (parseInt(inParts[0]) * 60 + parseInt(inParts[1]))) / 60 * 10) / 10;
    }
    await attendanceService.createAttendance({
      ...form, employee_name: emp?.full_name || '',
      clock_in: clockIn, clock_out: clockOut, working_hours: workingHours || undefined
    });
    toast({ title: 'Attendance marked' });
    setShowForm(false);
    setForm({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'present', clock_in: '', clock_out: '', notes: '' });
    loadData();
  };

  const markMyAttendance = async (status) => {
    const existing = records.find(r => r.employee_id === employee.user_id && r.date === new Date().toISOString().split('T')[0]);
    if (existing) { toast({ title: 'Already marked', description: 'Your attendance is already recorded for today' }); return; }
    await attendanceService.createAttendance({
      employee_id: employee.user_id, employee_name: employee.full_name,
      date: new Date().toISOString().split('T')[0], status, clock_in: new Date().toTimeString().slice(0, 5)
    });
    toast({ title: 'Attendance marked as ' + status });
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track daily attendance"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => markMyAttendance('present')} variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark Present</Button>
            {isAdmin && <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1.5" /> Mark Attendance</Button>}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard icon={UserCheck} label="Present Today" value={present} color="green" />
        <StatCard icon={UserCheck} label="Absent Today" value={absent} color="red" />
        <StatCard icon={UserCheck} label="Late Today" value={late} color="amber" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44 bg-white" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="wfh">WFH</SelectItem>
            <SelectItem value="leave">Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border animate-pulse p-8"><div className="h-12 bg-slate-100 rounded mb-2" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No attendance records" description="Mark attendance to get started" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="bg-slate-50 border-b">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Employee</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden sm:table-cell">Clock In</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden sm:table-cell">Clock Out</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden md:table-cell">Hours</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{r.employee_name || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{r.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 text-sm text-slate-600 hidden sm:table-cell">{r.clock_in || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 hidden sm:table-cell">{r.clock_out || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 hidden md:table-cell">{r.working_hours ? `${r.working_hours}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Employee</Label>
              <Select value={form.employee_id} onValueChange={v => setForm({...form, employee_id: v})}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.user_id || e.id} value={e.user_id || e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="wfh">Work From Home</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Clock In</Label>
              <Input type="time" value={form.clock_in} onChange={e => setForm({...form, clock_in: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Clock Out</Label>
              <Input type="time" value={form.clock_out} onChange={e => setForm({...form, clock_out: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.employee_id} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
