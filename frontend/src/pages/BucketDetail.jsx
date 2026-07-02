import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { bucketService } from '@/services/bucket.service';
import { taskService } from '@/services/task.service';
import { ArrowLeft, Plus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';

export default function BucketDetail() {
  const { id } = useParams();
  const { employee } = useOutletContext();
  const [bucket, setBucket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [b, t] = await Promise.all([
        bucketService.getBucket(id),
        taskService.filterTasks({ bucket_id: id }),
      ]);
      setBucket(b); setTasks(t); setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-200 rounded w-1/3 mb-4" /><div className="h-64 bg-slate-200 rounded" /></div>;
  if (!bucket) return <div className="text-center py-16"><p className="text-slate-500">Bucket not found</p><Button asChild className="mt-4"><Link to="/buckets">Back to Buckets</Link></Button></div>;

  const statusGroups = { todo: [], in_progress: [], in_review: [], completed: [] };
  tasks.forEach(t => { if (statusGroups[t.status]) statusGroups[t.status].push(t); else statusGroups.todo.push(t); });

  return (
    <div>
      <Link to="/buckets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Buckets
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: bucket.color || '#3B82F6' }} />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{bucket.name}</h1>
              {bucket.description && <p className="text-sm text-slate-500 mt-1">{bucket.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={bucket.priority} type="priority" />
            <StatusBadge status={bucket.status} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
          {bucket.owner_name && <span>Owner: {bucket.owner_name}</span>}
          {bucket.start_date && <span>Start: {bucket.start_date}</span>}
          {bucket.end_date && <span>End: {bucket.end_date}</span>}
          <span>{tasks.length} tasks</span>
        </div>
      </div>

      {/* Kanban-style columns */}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(statusGroups).map(([status, items]) => (
          <div key={status} className="bg-white rounded-xl border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 capitalize">{status.replace(/_/g, ' ')}</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No tasks</p>
              ) : items.map(t => (
                <Link key={t.id} to={`/tasks/${t.id}`} className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition">
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">{t.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={t.priority} type="priority" />
                    {t.due_date && <span className="text-xs text-slate-500">{t.due_date}</span>}
                  </div>
                  {t.assigned_to_name && <p className="text-xs text-slate-400 mt-1.5">{t.assigned_to_name}</p>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}