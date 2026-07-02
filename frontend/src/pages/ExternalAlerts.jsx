import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { settingsService } from '@/services/settings.service';
import { Plus, AlertTriangle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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

export default function ExternalAlerts() {
  const { employee } = useOutletContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', expiry_date: '', status: 'active' });

  const loadData = async () => { setAlerts(await settingsService.getAlerts('-created_date', 200)); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (editing) { await settingsService.updateAlert(editing.id, form); toast({ title: 'Alert updated' }); }
    else { await settingsService.createAlert(form); toast({ title: 'Alert created' }); }
    setShowForm(false); setEditing(null);
    setForm({ title: '', description: '', priority: 'medium', expiry_date: '', status: 'active' });
    loadData();
  };

  const handleEdit = (a) => { setEditing(a); setForm({ title: a.title || '', description: a.description || '', priority: a.priority || 'medium', expiry_date: a.expiry_date || '', status: a.status || 'active' }); setShowForm(true); };

  return (
    <div>
      <PageHeader title="External Alerts" description="Manage external notifications and alerts"
        actions={<Button onClick={() => { setEditing(null); setForm({ title: '', description: '', priority: 'medium', expiry_date: '', status: 'active' }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1.5" /> New Alert</Button>} />

      {loading ? <div className="bg-white rounded-xl border animate-pulse p-8"><div className="h-12 bg-slate-100 rounded" /></div> : alerts.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No alerts" description="Create an alert to notify your team" actionLabel="New Alert" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(a)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => { await settingsService.deleteAlert(a.id); loadData(); }} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={a.priority} type="priority" />
                <StatusBadge status={a.status} />
                {a.expiry_date && <span className="text-xs text-slate-400">Expires: {a.expiry_date}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Alert' : 'New Alert'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
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
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}