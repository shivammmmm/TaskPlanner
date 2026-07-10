import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { ArrowLeft, Clock, User, FolderKanban, Calendar, Send, Trash2, Plus, Upload, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

export default function TaskDetail() {
  const { id } = useParams();
  const { employee } = useOutletContext();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, c, a] = await Promise.all([
        taskService.getTask(id),
        taskService.getComments({ task_id: id }),
        taskService.getAttachments(id),
      ]);
      setTask(t);
      setComments(c.map(comm => ({
        ...comm,
        author_name: comm.employee_name || comm.author_name,
        author_id: comm.employee_id || comm.author_id
      })));
      setAttachments(a);
      setLoading(false);
    };
    load();
  }, [id]);

  const updateTask = async (data) => {
    await taskService.updateTask(id, data);
    setTask(prev => ({ ...prev, ...data }));
    toast({ title: 'Task updated' });
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const comment = await taskService.createComment({
      task_id: id, content: newComment, employee_id: employee?.user_id, employee_name: employee?.full_name
    });
    // Map backend response fields to UI (author_name -> employee_name)
    const uiComment = {
      ...comment,
      author_name: comment.employee_name,
      author_id: comment.employee_id
    };
    setComments(prev => [...prev, uiComment]);
    setNewComment('');
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const checklist = [...(task.checklist || []), { text: newCheckItem, completed: false }];
    updateTask({ checklist });
    setNewCheckItem('');
  };

  const toggleCheckItem = (idx) => {
    const checklist = [...(task.checklist || [])];
    checklist[idx] = { ...checklist[idx], completed: !checklist[idx].completed };
    updateTask({ checklist });
  };

  const removeCheckItem = (idx) => {
    const checklist = (task.checklist || []).filter((_, i) => i !== idx);
    updateTask({ checklist });
  };

  const uploadAttachment = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File is too large', description: 'Choose a file up to 5 MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const created = await taskService.uploadAttachment(id, { file_name: file.name, mime_type: file.type, size: file.size, data_url: dataUrl });
      setAttachments(prev => [created, ...prev]);
      toast({ title: 'Document uploaded' });
    } catch (error) {
      toast({ title: 'Could not upload document', description: error.response?.data?.message || error.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const removeAttachment = async (attachmentId) => {
    await taskService.deleteAttachment(id, attachmentId);
    setAttachments(prev => prev.filter(item => item.id !== attachmentId));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-64 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Task not found</p>
        <Button asChild className="mt-4"><Link to="/tasks">Back to Tasks</Link></Button>
      </div>
    );
  }

  const checklistDone = (task.checklist || []).filter(c => c.completed).length;
  const checklistTotal = (task.checklist || []).length;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-slate-900">{task.title}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.priority} type="priority" />
                <StatusBadge status={task.status} />
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{task.description}</p>
            )}

            {/* Status Quick Actions */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {['todo', 'in_progress', 'in_review', 'completed'].map(s => (
                <Button key={s} size="sm" variant={task.status === s ? 'default' : 'outline'}
                  onClick={() => updateTask({ status: s, ...(s === 'completed' ? { completed_at: new Date().toISOString() } : {}) })}
                  className={task.status === s ? 'bg-blue-600' : ''}>
                  {s.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Checklist {checklistTotal > 0 && `(${checklistDone}/${checklistTotal})`}</h2>
            </div>
            {checklistTotal > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${checklistTotal ? (checklistDone / checklistTotal) * 100 : 0}%` }} />
              </div>
            )}
            <div className="space-y-2">
              {(task.checklist || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <Checkbox checked={item.completed} onCheckedChange={() => toggleCheckItem(idx)} />
                  <span className={`text-sm flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                  <button onClick={() => removeCheckItem(idx)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} placeholder="Add checklist item..."
                className="flex-1" onKeyDown={e => e.key === 'Enter' && addCheckItem()} />
              <Button size="sm" variant="outline" onClick={addCheckItem}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Documents ({attachments.length})</h2>
              <Button asChild size="sm" variant="outline">
                <label className="cursor-pointer"><Upload className="w-4 h-4 mr-1.5" />{uploading ? 'Uploading…' : 'Upload'}<input type="file" className="hidden" disabled={uploading} onChange={uploadAttachment} /></label>
              </Button>
            </div>
            {attachments.length === 0 ? <p className="text-sm text-slate-400">No documents attached</p> : (
              <div className="space-y-2">{attachments.map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <a href={item.data_url} download={item.file_name} className="text-sm text-blue-600 hover:underline flex-1 truncate">{item.file_name}</a>
                  <span className="text-xs text-slate-400">{Math.ceil(item.size / 1024)} KB</span>
                  <button onClick={() => removeAttachment(item.id)} aria-label={`Delete ${item.file_name}`} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}</div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Comments ({comments.length})</h2>
            <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
              ) : comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {c.author_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{c.author_name}</span>
                      <span className="text-xs text-slate-400">{format(new Date(c.created_date), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..."
                className="flex-1" onKeyDown={e => e.key === 'Enter' && addComment()} />
              <Button onClick={addComment} size="sm" className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Bucket:</span>
                <span className="font-medium text-slate-700">{task.bucket_name || 'None'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Assigned to:</span>
                <span className="font-medium text-slate-700">{task.assigned_to_name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Assigned by:</span>
                <span className="font-medium text-slate-700">{task.assigned_by_name || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Start:</span>
                <span className="font-medium text-slate-700">{task.start_date || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Due:</span>
                <span className="font-medium text-slate-700">{task.due_date || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Estimated:</span>
                <span className="font-medium text-slate-700">{task.estimated_hours ? `${task.estimated_hours}h` : '—'}</span>
              </div>
              {task.is_recurring && (
                <div className="text-sm">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Recurring · {task.recurrence_pattern}
                  </span>
                </div>
              )}
              {task.labels?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((l, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-2">Created</h3>
            <p className="text-sm text-slate-500">{format(new Date(task.created_date), 'MMM d, yyyy · h:mm a')}</p>
            {task.completed_at && (
              <>
                <h3 className="font-semibold text-slate-900 text-sm mt-3 mb-2">Completed</h3>
                <p className="text-sm text-slate-500">{format(new Date(task.completed_at), 'MMM d, yyyy · h:mm a')}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
