import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';

export default function Profile() {
  const { employee } = useOutletContext();
  const [form, setForm] = useState({
    full_name: employee?.full_name || '',
    mobile: employee?.mobile || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await authService.updateEmployee(employee.id, form);
    await authService.updateMe({ full_name: form.full_name });
    setSaving(false);
    toast({ title: 'Profile updated' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="My Profile" description="Manage your personal information" />

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {employee?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{employee?.full_name}</h2>
            <p className="text-sm text-slate-500">{employee?.email}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {employee?.role?.replace('_', ' ')} · {employee?.employee_code}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1" /></div>
            <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Department</Label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="mt-1" /></div>
            <div><Label>Designation</Label><Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input value={employee?.email || ''} disabled className="mt-1 bg-slate-50" /></div>
            <div><Label>Employee Code</Label><Input value={employee?.employee_code || ''} disabled className="mt-1 bg-slate-50" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Role</Label><Input value={employee?.role?.replace('_', ' ') || ''} disabled className="mt-1 bg-slate-50 capitalize" /></div>
            <div><Label>Joining Date</Label><Input value={employee?.joining_date || ''} disabled className="mt-1 bg-slate-50" /></div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 mt-2">
            <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}