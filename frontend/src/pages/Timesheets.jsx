import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { timesheetService } from '@/services/timesheet.service';
import { taskService } from '@/services/task.service';
import { Plus, Search, Clock, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

export default function Timesheets() {
  const { employee } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockEntry, setClockEntry] = useState(null);
  const [form, setForm] = useState({ task_id: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', is_billable: true });

  const loadData = async () => {
    const [e, t] = await Promise.all([
      timesheetService.filterTimesheets({ employee_id: employee?.user_id }),
      taskService.getTasks('-created_date', 200),
    ]);
    setEntries(e.sort((a, b) => b.date?.localeCompare(a.date)));
    setTasks(t);
    const todayClock = e.find(x => x.date === new Date().toISOString().split('T')[0] && x.clock_in && !x.clock_out);
    if (todayClock) { setClockedIn(true); setClockEntry(todayClock); }
    setLoading(false);
  };

  useEffect(() => { if (employee) loadData(); }, [employee]);

  const handleClockIn = async () => {
    const now = format(new Date(), 'HH:mm');
    const entry = await timesheetService.createTimesheet({
      employee_id: employee.user_id, employee_name: employee.full_name,
      date: new Date().toISOString().split('T')[0], hours: 0, clock_in: now, description: 'Clock-in entry'
    });
    setClockedIn(true); setClockEntry(entry);
    toast({ title: `Clocked in at ${now}` });
    loadData();
  };

  const handleClockOut = async () => {
    if (!clockEntry) return;
    const now = format(new Date(), 'HH:mm');
    const inParts = clockEntry.clock_in.split(':');
    const outParts = now.split(':');
    const hours = Math.round(((parseInt(outParts[0]) * 60 + parseInt(outParts[1])) - (parseInt(inParts[0]) * 60 + parseInt(inParts[1]))) / 60 * 10) / 10;
    await timesheetService.updateTimesheet(clockEntry.id, { clock_out: now, hours: Math.max(hours, 0) });
    setClockedIn(false); setClockEntry(null);
    toast({ title: `Clocked out at ${now}` });
    loadData();
  };

  const handleSave = async () => {
    const task = tasks.find(t => t.id === form.task_id);
    await timesheetService.createTimesheet({
      ...form, hours: Number(form.hours),
      employee_id: employee.user_id, employee_name: employee.full_name,
      task_title: task?.title || '', bucket_id: task?.bucket_id || '', bucket_name: task?.bucket_name || ''
    });
    toast({ title: 'Time entry added' });
    setShowForm(false);
    setForm({ task_id: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', is_billable: true });
    loadData();
  };

  const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const billableHours = entries.filter(e => e.is_billable).reduce((sum, e) => sum + (e.hours || 0), 0);

  const filtered = entries.filter(e => {
    if (search && !e.task_title?.toLowerCase().includes(search.toLowerCase()) && !e.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Timesheets"
        description={`${totalHours.toFixed(1)} total hours · ${billableHours.toFixed(1)} billable`}
        actions={
          <div className="flex gap-2">
            <Button onClick={clockedIn ? handleClockOut : handleClockIn}
              variant={clockedIn ? 'destructive' : 'default'}
              className={clockedIn ? '' : 'bg-emerald-600 hover:bg-emerald-700'}>
              {clockedIn ? <><Square className="w-4 h-4 mr-1.5" /> Clock Out</> : <><Play className="w-4 h-4 mr-1.5" /> Clock In</>}
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1.5" /> Manual Entry
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search entries..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border animate-pulse p-8"><div className="h-12 bg-slate-100 rounded mb-2" /><div className="h-12 bg-slate-100 rounded mb-2" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No time entries" description="Start tracking your time" actionLabel="Add Entry" onAction={() => setShowForm(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Task</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden md:table-cell">Description</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Hours</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden sm:table-cell">Clock In/Out</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Billable</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm text-slate-900">{e.date}</td>
                  <td className="px-5 py-3 text-sm text-slate-700">{e.task_title || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell truncate max-w-[200px]">{e.description || '—'}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900">{e.hours}h</td>
                  <td className="px-5 py-3 text-sm text-slate-500 hidden sm:table-cell">{e.clock_in || '—'} {e.clock_out ? `→ ${e.clock_out}` : ''}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${e.is_billable !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{e.is_billable !== false ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Manual Time Entry</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Hours *</Label>
              <Input type="number" step="0.5" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Task</Label>
              <Select value={form.task_id} onValueChange={v => setForm({...form, task_id: v})}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select task" /></SelectTrigger>
                <SelectContent>
                  {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
            </div>
            <div className="flex items-center gap-2 py-2 md:col-span-2">
              <Checkbox id="is_billable" checked={form.is_billable} onCheckedChange={v => setForm({...form, is_billable: v})} />
              <Label htmlFor="is_billable" className="cursor-pointer">Billable</Label>
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.hours} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}