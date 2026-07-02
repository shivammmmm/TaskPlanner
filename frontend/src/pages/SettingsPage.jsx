import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { settingsService } from '@/services/settings.service';
import { Settings, Building, Globe, Clock, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';

export default function SettingsPage() {
  const { employee } = useOutletContext();
  const [settings, setSettings] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyForm, setCompanyForm] = useState({ company_name: '', timezone: 'UTC', language: 'en', work_start_time: '09:00', work_end_time: '18:00' });
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', type: 'public' });

  useEffect(() => {
    const load = async () => {
      const [s, h] = await Promise.all([
        settingsService.getCompanySettings(),
        settingsService.getHolidays('date', 100),
      ]);
      if (s) {
        setSettings(s);
        setCompanyForm({
          company_name: s.company_name || '', timezone: s.timezone || 'UTC',
          language: s.language || 'en', work_start_time: s.work_start_time || '09:00',
          work_end_time: s.work_end_time || '18:00'
        });
      }
      setHolidays(h);
      setLoading(false);
    };
    load();
  }, []);

  const saveCompany = async () => {
    if (settings) {
      await settingsService.updateCompanySettings(settings.id, companyForm);
    } else {
      const created = await settingsService.createCompanySettings(companyForm);
      setSettings(created);
    }
    toast({ title: 'Settings saved' });
  };

  const addHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) return;
    await settingsService.createHoliday(holidayForm);
    setHolidayForm({ name: '', date: '', type: 'public' });
    setHolidays(await settingsService.getHolidays('date', 100));
    toast({ title: 'Holiday added' });
  };

  const deleteHoliday = async (id) => {
    await settingsService.deleteHoliday(id);
    setHolidays(await settingsService.getHolidays('date', 100));
    toast({ title: 'Holiday removed' });
  };

  if (loading) return <div className="max-w-3xl mx-auto animate-pulse"><div className="h-8 bg-slate-200 rounded w-1/3 mb-6" /><div className="h-64 bg-slate-200 rounded" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Settings" description="Manage your workspace settings" />

      <Tabs defaultValue="company">
        <TabsList className="bg-white border mb-6">
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div><Label>Company Name</Label><Input value={companyForm.company_name} onChange={e => setCompanyForm({...companyForm, company_name: e.target.value})} className="mt-1 max-w-md" /></div>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <Label>Timezone</Label>
                <Select value={companyForm.timezone} onValueChange={v => setCompanyForm({...companyForm, timezone: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                    <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select value={companyForm.language} onValueChange={v => setCompanyForm({...companyForm, language: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div><Label>Work Start</Label><Input type="time" value={companyForm.work_start_time} onChange={e => setCompanyForm({...companyForm, work_start_time: e.target.value})} className="mt-1" /></div>
              <div><Label>Work End</Label><Input type="time" value={companyForm.work_end_time} onChange={e => setCompanyForm({...companyForm, work_end_time: e.target.value})} className="mt-1" /></div>
            </div>
            <Button onClick={saveCompany} className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-1.5" /> Save Settings</Button>
          </div>
        </TabsContent>

        <TabsContent value="holidays">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Holiday Master</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <Input placeholder="Holiday name" value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} className="max-w-xs" />
              <Input type="date" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} className="w-44" />
              <Select value={holidayForm.type} onValueChange={v => setHolidayForm({...holidayForm, type: v})}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addHoliday} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
            {holidays.length === 0 ? <p className="text-sm text-slate-400">No holidays added</p> : (
              <div className="space-y-2">
                {holidays.map(h => (
                  <div key={h.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900">{h.name}</span>
                      <span className="text-xs text-slate-500">{h.date}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">{h.type}</span>
                    </div>
                    <button onClick={() => deleteHoliday(h.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="general">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">General Settings</h3>
            <p className="text-sm text-slate-500">Configure notification preferences, leave policies, and other system-wide settings from this section.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}