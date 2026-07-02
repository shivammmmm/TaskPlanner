import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { noticeService } from '@/services/notice.service';
import { Plus, Megaphone, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

export default function NoticeBoard() {
  const { employee } = useOutletContext();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', content: '', priority: 'medium', publish_date: new Date().toISOString().split('T')[0],
    expiry_date: '', department: '', comments_disabled: false
  });

  const loadData = async () => { setNotices(await noticeService.getNotices('-created_date', 200)); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') { setShowForm(true); window.history.replaceState({}, '', '/notices'); }
  }, []);

  const handleSave = async () => {
    const data = { ...form, author_id: employee?.user_id, author_name: employee?.full_name };
    if (editing) { await noticeService.updateNotice(editing.id, data); toast({ title: 'Notice updated' }); }
    else { await noticeService.createNotice(data); toast({ title: 'Notice published' }); }
    setShowForm(false); setEditing(null);
    setForm({ title: '', content: '', priority: 'medium', publish_date: new Date().toISOString().split('T')[0], expiry_date: '', department: '', comments_disabled: false });
    loadData();
  };

  const handleEdit = (n) => {
    setEditing(n); setForm({
      title: n.title || '', content: n.content || '', priority: n.priority || 'medium',
      publish_date: n.publish_date || '', expiry_date: n.expiry_date || '',
      department: n.department || '', comments_disabled: n.comments_disabled || false
    }); setShowForm(true);
  };

  return (
    <div>
      <PageHeader title="Notice Board" description="Company announcements and notices"
        actions={<Button onClick={() => { setEditing(null); setForm({ title: '', content: '', priority: 'medium', publish_date: new Date().toISOString().split('T')[0], expiry_date: '', department: '', comments_disabled: false }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1.5" /> New Notice</Button>} />

      {loading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border animate-pulse p-6"><div className="h-5 bg-slate-200 rounded w-1/3 mb-2" /><div className="h-3 bg-slate-200 rounded w-2/3" /></div>)}</div> : notices.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices" description="Post a notice for your team" actionLabel="New Notice" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
          {notices.map(n => (
            <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={n.priority} type="priority" />
                    {n.department && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{n.department}</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{n.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{n.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span>By {n.author_name || 'Unknown'}</span>
                    {n.publish_date && <span>Published {n.publish_date}</span>}
                    {n.expiry_date && <span>Expires {n.expiry_date}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(n)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => { await noticeService.deleteNotice(n.id); loadData(); }} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Notice' : 'New Notice'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Content *</Label>
              <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="All" />
            </div>
            <div className="space-y-2">
              <Label>Publish Date</Label>
              <Input type="date" value={form.publish_date} onChange={e => setForm({...form, publish_date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 py-2 md:col-span-2">
              <Checkbox id="comments_disabled" checked={form.comments_disabled} onCheckedChange={v => setForm({...form, comments_disabled: v})} />
              <Label htmlFor="comments_disabled" className="cursor-pointer">Disable Comments</Label>
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.content} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">{editing ? 'Update' : 'Publish'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}