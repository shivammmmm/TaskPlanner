import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { bucketService } from '@/services/bucket.service';
import { authService } from '@/services/auth.service';
import { Plus, Search, CheckSquare, MoreHorizontal, Edit, Trash2, Copy, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

export default function Tasks() {
  const { employee } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [bucketFilter, setBucketFilter] = useState('all');
  const [viewTab, setViewTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', bucket_id: '', assigned_to_id: '', priority: 'medium',
    status: 'todo', due_date: '', start_date: '', estimated_hours: '', is_recurring: false,
    recurrence_pattern: 'none', labels: []
  });

  const loadData = async () => {
    const [t, b, e] = await Promise.all([
      taskService.getTasks('-created_date', 200),
      bucketService.getBuckets('-created_date', 200),
      authService.filterEmployees({ status: 'active' }),
    ]);
    setTasks(t); setBuckets(b); setEmployees(e);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') { setShowForm(true); window.history.replaceState({}, '', '/tasks'); }
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const getViewTasks = () => {
    let list = tasks;
    if (viewTab === 'assigned_to_me') list = list.filter(t => t.assigned_to_id === employee?.user_id);
    else if (viewTab === 'assigned_by_me') list = list.filter(t => t.assigned_by_id === employee?.user_id);
    else if (viewTab === 'completed') list = list.filter(t => t.status === 'completed');
    else if (viewTab === 'pending') list = list.filter(t => t.status === 'todo' || t.status === 'in_progress');
    else if (viewTab === 'overdue') list = list.filter(t => t.due_date && t.due_date < today && t.status !== 'completed' && t.status !== 'archived');
    else if (viewTab === 'recurring') list = list.filter(t => t.is_recurring);
    return list;
  };

  const filtered = getViewTasks().filter(t => {
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (bucketFilter !== 'all' && t.bucket_id !== bucketFilter) return false;
    return true;
  });

  const handleSave = async () => {
    const assignee = employees.find(e => e.user_id === form.assigned_to_id);
    const bucket = buckets.find(b => b.id === form.bucket_id);
    const data = {
      ...form,
      estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : undefined,
      assigned_by_id: employee?.user_id,
      assigned_by_name: employee?.full_name,
      assigned_to_name: assignee?.full_name || '',
      bucket_name: bucket?.name || '',
    };
    if (editing) {
      await taskService.updateTask(editing.id, data);
      toast({ title: 'Task updated' });
    } else {
      await taskService.createTask(data);
      toast({ title: 'Task created' });
    }
    setShowForm(false); setEditing(null);
    setForm({ title: '', description: '', bucket_id: '', assigned_to_id: '', priority: 'medium', status: 'todo', due_date: '', start_date: '', estimated_hours: '', is_recurring: false, recurrence_pattern: 'none', labels: [] });
    loadData();
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title || '', description: t.description || '', bucket_id: t.bucket_id || '',
      assigned_to_id: t.assigned_to_id || '', priority: t.priority || 'medium', status: t.status || 'todo',
      due_date: t.due_date || '', start_date: t.start_date || '',
      estimated_hours: t.estimated_hours || '', is_recurring: t.is_recurring || false,
      recurrence_pattern: t.recurrence_pattern || 'none', labels: t.labels || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this task?')) {
      await taskService.deleteTask(id);
      toast({ title: 'Task deleted' });
      loadData();
    }
  };

  const handleDuplicate = async (t) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = t;
    await taskService.createTask({ ...rest, title: t.title + ' (Copy)', status: 'todo' });
    toast({ title: 'Task duplicated' });
    loadData();
  };

  const quickStatus = async (id, status) => {
    const updateData = { status };
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    await taskService.updateTask(id, updateData);
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={`${tasks.length} total tasks`}
        actions={
          <Button onClick={() => { setEditing(null); setForm({ title: '', description: '', bucket_id: '', assigned_to_id: '', priority: 'medium', status: 'todo', due_date: '', start_date: '', estimated_hours: '', is_recurring: false, recurrence_pattern: 'none', labels: [] }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" /> New Task
          </Button>
        }
      />

      {/* View Tabs */}
      <Tabs value={viewTab} onValueChange={setViewTab} className="mb-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="assigned_to_me">Assigned To Me</TabsTrigger>
          <TabsTrigger value="assigned_by_me">Assigned By Me</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search tasks..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        {buckets.length > 0 && (
          <Select value={bucketFilter} onValueChange={setBucketFilter}>
            <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Bucket" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              {buckets.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="bg-white rounded-xl border animate-pulse p-8">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded mb-2" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Create your first task to get started" actionLabel="New Task" onAction={() => setShowForm(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map(task => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition group">
                <button onClick={() => quickStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')} className="shrink-0">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-400'}`}>
                    {task.status === 'completed' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
                <Link to={`/tasks/${task.id}`} className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    {task.bucket_name && <span>{task.bucket_name}</span>}
                    {task.assigned_to_name && <span>· {task.assigned_to_name}</span>}
                    {task.due_date && <span>· Due {task.due_date}</span>}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.priority} type="priority" />
                  <StatusBadge status={task.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(task)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(task)}><Copy className="w-3.5 h-3.5 mr-2" />Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Task' : 'New Task'}</DialogTitle>
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
              <Label>Bucket</Label>
              <Select value={form.bucket_id} onValueChange={v => setForm({...form, bucket_id: v})}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select bucket" /></SelectTrigger>
                <SelectContent>
                  {buckets.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={form.assigned_to_id} onValueChange={v => setForm({...form, assigned_to_id: v})}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.user_id || e.id} value={e.user_id || e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
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
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Estimated Hours</Label>
              <Input type="number" value={form.estimated_hours} onChange={e => setForm({...form, estimated_hours: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 py-2 md:col-span-2">
              <Checkbox id="is_recurring" checked={form.is_recurring} onCheckedChange={v => setForm({...form, is_recurring: v})} />
              <Label htmlFor="is_recurring" className="cursor-pointer">Recurring Task</Label>
            </div>
            {form.is_recurring && (
              <div className="space-y-2 md:col-span-2">
                <Label>Recurrence Pattern</Label>
                <Select value={form.recurrence_pattern} onValueChange={v => setForm({...form, recurrence_pattern: v})}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">
              {editing ? 'Update' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}