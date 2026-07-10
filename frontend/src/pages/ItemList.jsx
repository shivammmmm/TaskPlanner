import React, { useState, useEffect } from 'react';
import { itemService } from '@/services/item.service';
import { Plus, Search, List, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ name: '', description: '', category: '', status: 'available', quantity: 1 });

  const loadData = async () => { setItems(await itemService.getItems('-created_date', 200)); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  const filtered = items.filter(i => {
    if (search && !i.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const handleSave = async () => {
    const data = { ...form, quantity: Number(form.quantity) };
    if (editing) { await itemService.updateItem(editing.id, data); toast({ title: 'Item updated' }); }
    else { await itemService.createItem(data); toast({ title: 'Item added' }); }
    setShowForm(false); setEditing(null);
    setForm({ name: '', description: '', category: '', status: 'available', quantity: 1 });
    loadData();
  };

  const handleEdit = (i) => {
    setEditing(i); setForm({ name: i.name || '', description: i.description || '', category: i.category || '', status: i.status || 'available', quantity: i.quantity || 1 }); setShowForm(true);
  };

  return (
    <div>
      <PageHeader title="Item List" description="Manage inventory and items"
        actions={<Button onClick={() => { setEditing(null); setForm({ name: '', description: '', category: '', status: 'available', quantity: 1 }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1.5" /> Add Item</Button>} />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search items..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="bg-white rounded-xl border animate-pulse p-8"><div className="h-12 bg-slate-100 rounded" /></div> : filtered.length === 0 ? (
        <EmptyState icon={List} title="No items" description="Add items to your inventory" actionLabel="Add Item" onAction={() => setShowForm(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="bg-slate-50 border-b">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden md:table-cell">Category</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Qty</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-5 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3"><p className="text-sm font-medium text-slate-900">{i.name}</p>{i.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{i.description}</p>}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 hidden md:table-cell">{i.category || '—'}</td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{i.quantity}</td>
                  <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(i)}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => { await itemService.deleteItem(i.id); loadData(); }} className="text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white">{editing ? 'Update' : 'Add Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
