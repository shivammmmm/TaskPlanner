import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { bucketService } from '@/services/bucket.service';
import { Plus, Search, FolderKanban, MoreHorizontal, Edit, Trash2, Archive } from 'lucide-react';
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

const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#F97316'];

export default function Buckets() {
  const { employee } = useOutletContext();
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', priority: 'medium', status: 'active',
    color: '#3B82F6', start_date: '', end_date: ''
  });

  const loadBuckets = async () => {
    const data = await bucketService.getBuckets('-created_date', 200);
    setBuckets(data);
    setLoading(false);
  };

  useEffect(() => { loadBuckets(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') { setShowForm(true); window.history.replaceState({}, '', '/buckets'); }
  }, []);

  const filtered = buckets.filter(b => {
    if (search && !b.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (!b.is_archived) return true;
    return statusFilter === 'archived';
  });

  const handleSave = async () => {
    const data = { ...form, owner_id: employee?.user_id, owner_name: employee?.full_name };
    if (editing) {
      await bucketService.updateBucket(editing.id, data);
      toast({ title: 'Bucket updated' });
    } else {
      await bucketService.createBucket(data);
      toast({ title: 'Bucket created' });
    }
    setShowForm(false); setEditing(null);
    setForm({ name: '', description: '', priority: 'medium', status: 'active', color: '#3B82F6', start_date: '', end_date: '' });
    loadBuckets();
  };

  const handleEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name || '', description: b.description || '', priority: b.priority || 'medium', status: b.status || 'active', color: b.color || '#3B82F6', start_date: b.start_date || '', end_date: b.end_date || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this bucket?')) {
      await bucketService.deleteBucket(id);
      toast({ title: 'Bucket deleted' });
      loadBuckets();
    }
  };

  return (
    <div>
      <PageHeader
        title="Buckets"
        description="Manage your projects and workspaces"
        actions={
          <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', priority: 'medium', status: 'active', color: '#3B82F6', start_date: '', end_date: '' }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" /> New Bucket
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search buckets..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl border p-5 animate-pulse"><div className="h-4 bg-slate-200 rounded w-3/4 mb-3" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No buckets found" description="Create a bucket to organize your tasks" actionLabel="New Bucket" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow overflow-hidden group">
              <div className="h-1.5" style={{ backgroundColor: b.color || '#3B82F6' }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/buckets/${b.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition">{b.name}</h3>
                    {b.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{b.description}</p>}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(b)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(b.id)} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <StatusBadge status={b.priority} type="priority" />
                  <StatusBadge status={b.status} />
                  {b.end_date && <span className="text-xs text-slate-500">Due {b.end_date}</span>}
                </div>
                {b.owner_name && <p className="text-xs text-slate-400 mt-3">Owner: {b.owner_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Bucket' : 'New Bucket'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
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
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {colors.map(c => (
                  <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                    className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">
              {editing ? 'Update' : 'Create Bucket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}