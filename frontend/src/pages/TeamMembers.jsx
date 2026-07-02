import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Plus, Search, Upload, Download, MoreHorizontal, UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';

export default function TeamMembers() {
  const { employee } = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', mobile: '', department: '', designation: '',
    role: 'employee', joining_date: '', status: 'active', employee_code: ''
  });

  const isSuperAdmin = employee?.role === 'super_admin';

  const loadEmployees = async () => {
    const data = await authService.listEmployees('-created_date', 200);
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => { loadEmployees(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1' && isSuperAdmin) { setShowForm(true); window.history.replaceState({}, '', '/team'); }
  }, [isSuperAdmin]);

  const filtered = employees.filter(e => {
    if (search && !e.full_name?.toLowerCase().includes(search.toLowerCase()) &&
        !e.email?.toLowerCase().includes(search.toLowerCase()) &&
        !e.employee_code?.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && e.role !== roleFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (deptFilter !== 'all' && e.department !== deptFilter) return false;
    return true;
  });

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const handleSave = async () => {
    const data = { ...form };
    if (!data.employee_code) data.employee_code = 'EMP-' + Date.now().toString(36).toUpperCase();
    
    // Password validation on creation
    if (!editing && !data.password) {
      toast({ title: 'Password required', variant: 'destructive' });
      return;
    }

    if (editing) {
      await authService.updateEmployee(editing.id, data);
      toast({ title: 'Employee updated' });
    } else {
      await authService.createEmployee(data);
      toast({ title: 'Employee added' });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ full_name: '', email: '', password: '', mobile: '', department: '', designation: '', role: 'employee', joining_date: '', status: 'active', employee_code: '' });
    loadEmployees();
  };

  const handleEdit = (emp) => {
    setEditing(emp);
    setForm({
      full_name: emp.full_name || '', email: emp.email || '', password: '', mobile: emp.mobile || '',
      department: emp.department || '', designation: emp.designation || '', role: emp.role || 'employee',
      joining_date: emp.joining_date || '', status: emp.status || 'active', employee_code: emp.employee_code || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      await authService.deleteEmployee(id);
      toast({ title: 'Employee removed' });
      loadEmployees();
    }
  };

  return (
    <div>
      <PageHeader
        title="Team Members"
        description={`${employees.length} members`}
        actions={isSuperAdmin && (
          <Button onClick={() => { setEditing(null); setForm({ full_name: '', email: '', password: '', mobile: '', department: '', designation: '', role: 'employee', joining_date: '', status: 'active', employee_code: '' }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" /> Add Member
          </Button>
        )}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name, email, code..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
            <SelectItem value="company_admin">Company Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="team_leader">Team Leader</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
        {departments.length > 0 && (
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border animate-pulse p-8">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded mb-2" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserPlus} title="No team members found" description="Add your first team member to get started" actionLabel="Add Member" onAction={() => setShowForm(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Code</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Department</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  {isSuperAdmin && <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                          {emp.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{emp.full_name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">{emp.employee_code}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell">{emp.department || '—'}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-medium text-slate-600 capitalize">{emp.role?.replace('_', ' ')}</span></td>
                    <td className="px-5 py-3.5"><StatusBadge status={emp.status} /></td>
                    {isSuperAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(emp)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(emp.id)} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Employee Code</Label>
              <Input value={form.employee_code} onChange={e => setForm({...form, employee_code: e.target.value})} placeholder="Auto-generated" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{editing ? 'Password (leave blank to keep current)' : 'Password *'}</Label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editing ? '••••••••' : ''} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="team_leader">Team Leader</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input type="date" value={form.joining_date} onChange={e => setForm({...form, joining_date: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.full_name || !form.email || (!editing && !form.password)} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">
              {editing ? 'Update' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}