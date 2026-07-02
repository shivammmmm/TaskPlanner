import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { meetingService } from '@/services/meeting.service';
import { Plus, Video, MoreHorizontal, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';

export default function Meetings() {
  const { employee } = useOutletContext();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', description: '', agenda: '', date: '', start_time: '', end_time: '',
    status: 'scheduled', reminder: '30min', location: ''
  });

  const loadData = async () => { setMeetings(await meetingService.getMeetings('-date', 200)); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') { setShowForm(true); window.history.replaceState({}, '', '/meetings'); }
  }, []);

  const filtered = meetings.filter(m => statusFilter === 'all' || m.status === statusFilter);

  const handleSave = async () => {
    const data = { ...form, organizer_id: employee?.user_id, organizer_name: employee?.full_name };
    if (editing) { await meetingService.updateMeeting(editing.id, data); toast({ title: 'Meeting updated' }); }
    else { await meetingService.createMeeting(data); toast({ title: 'Meeting scheduled' }); }
    setShowForm(false); setEditing(null);
    setForm({ title: '', description: '', agenda: '', date: '', start_time: '', end_time: '', status: 'scheduled', reminder: '30min', location: '' });
    loadData();
  };

  const handleEdit = (m) => {
    setEditing(m); setForm({
      title: m.title || '', description: m.description || '', agenda: m.agenda || '',
      date: m.date || '', start_time: m.start_time || '', end_time: m.end_time || '',
      status: m.status || 'scheduled', reminder: m.reminder || '30min', location: m.location || ''
    }); setShowForm(true);
  };

  const upcoming = filtered.filter(m => m.date >= new Date().toISOString().split('T')[0]);
  const past = filtered.filter(m => m.date < new Date().toISOString().split('T')[0]);

  return (
    <div>
      <PageHeader title="Meetings" description="Schedule and manage meetings"
        actions={<Button onClick={() => { setEditing(null); setForm({ title: '', description: '', agenda: '', date: '', start_time: '', end_time: '', status: 'scheduled', reminder: '30min', location: '' }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1.5" /> New Meeting</Button>} />

      <div className="flex gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border animate-pulse p-6"><div className="h-5 bg-slate-200 rounded w-1/3" /></div>)}</div> : filtered.length === 0 ? (
        <EmptyState icon={Video} title="No meetings" description="Schedule a meeting" actionLabel="New Meeting" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(m => (
                  <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-slate-500">{m.date} · {m.start_time || '—'} - {m.end_time || '—'}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <h3 className="font-semibold text-slate-900">{m.title}</h3>
                        {m.description && <p className="text-sm text-slate-500 mt-1">{m.description}</p>}
                        {m.location && <p className="text-xs text-slate-400 mt-1">📍 {m.location}</p>}
                        <p className="text-xs text-slate-400 mt-1">Organized by {m.organizer_name || 'Unknown'}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(m)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => { await meetingService.deleteMeeting(m.id); loadData(); }} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h2>
              <div className="space-y-3">
                {past.map(m => (
                  <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 opacity-75">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">{m.date}</span>
                      <h3 className="font-medium text-slate-700">{m.title}</h3>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Meeting' : 'New Meeting'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Agenda</Label>
              <Textarea value={form.agenda} onChange={e => setForm({...form, agenda: e.target.value})} rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Room, link, etc." />
            </div>
            <div className="space-y-2">
              <Label>Reminder</Label>
              <Select value={form.reminder} onValueChange={v => setForm({...form, reminder: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 minutes</SelectItem>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="1hr">1 hour</SelectItem>
                  <SelectItem value="1day">1 day</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.date} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">
              {editing ? 'Update' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}