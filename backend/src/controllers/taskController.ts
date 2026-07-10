import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        checklist: true
      },
      orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing tasks' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        checklist: true
      }
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    return res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching task' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  const {
    title, description, bucket_id, bucket_name,
    assigned_to_id, assigned_to_name, assigned_by_id, assigned_by_name,
    priority, status, start_date, due_date, estimated_hours,
    is_recurring, recurrence_pattern, labels, completed_at, checklist
  } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  try {
    // 1. Create the task record
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        bucket_id: bucket_id || null,
        bucket_name: bucket_name || null,
        assigned_to_id: assigned_to_id || null,
        assigned_to_name: assigned_to_name || null,
        assigned_by_id: assigned_by_id || null,
        assigned_by_name: assigned_by_name || null,
        priority: priority || 'medium',
        status: status || 'todo',
        start_date: start_date || null,
        due_date: due_date || null,
        estimated_hours: estimated_hours !== undefined ? parseFloat(estimated_hours) : null,
        is_recurring: is_recurring || false,
        recurrence_pattern: recurrence_pattern || 'none',
        labels: labels || [],
        completed_at: completed_at || null
      }
    });

    // 2. Add checklists if provided
    if (checklist && Array.isArray(checklist)) {
      await prisma.taskChecklist.createMany({
        data: checklist.map((item: any) => ({
          task_id: task.id,
          text: item.text,
          completed: item.completed || false
        }))
      });
    }

    // 3. Return created task with checklist
    const createdTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: { checklist: true }
    });

    return res.status(201).json({ success: true, data: createdTask });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    title, description, bucket_id, bucket_name,
    assigned_to_id, assigned_to_name, assigned_by_id, assigned_by_name,
    priority, status, start_date, due_date, estimated_hours,
    is_recurring, recurrence_pattern, labels, completed_at, checklist
  } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // 1. Update checklists if provided
    if (checklist !== undefined && Array.isArray(checklist)) {
      // Delete old checklists
      await prisma.taskChecklist.deleteMany({
        where: { task_id: id }
      });
      // Insert new ones
      if (checklist.length > 0) {
        await prisma.taskChecklist.createMany({
          data: checklist.map((item: any) => ({
            task_id: id,
            text: item.text,
            completed: item.completed || false
          }))
        });
      }
    }

    // 2. Update task details
    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        bucket_id: bucket_id !== undefined ? bucket_id : task.bucket_id,
        bucket_name: bucket_name !== undefined ? bucket_name : task.bucket_name,
        assigned_to_id: assigned_to_id !== undefined ? assigned_to_id : task.assigned_to_id,
        assigned_to_name: assigned_to_name !== undefined ? assigned_to_name : task.assigned_to_name,
        assigned_by_id: assigned_by_id !== undefined ? assigned_by_id : task.assigned_by_id,
        assigned_by_name: assigned_by_name !== undefined ? assigned_by_name : task.assigned_by_name,
        priority: priority !== undefined ? priority : task.priority,
        status: status !== undefined ? status : task.status,
        start_date: start_date !== undefined ? start_date : task.start_date,
        due_date: due_date !== undefined ? due_date : task.due_date,
        estimated_hours: estimated_hours !== undefined ? parseFloat(estimated_hours) : task.estimated_hours,
        is_recurring: is_recurring !== undefined ? is_recurring : task.is_recurring,
        recurrence_pattern: recurrence_pattern !== undefined ? recurrence_pattern : task.recurrence_pattern,
        labels: labels !== undefined ? labels : task.labels,
        completed_at: completed_at !== undefined ? completed_at : task.completed_at
      },
      include: {
        checklist: true
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating task' });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, completed_at } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const updated = await prisma.task.update({
      where: { id },
      data: {
        status,
        completed_at: completed_at !== undefined ? completed_at : (status === 'completed' ? new Date().toISOString() : null)
      },
      include: {
        checklist: true
      }
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating status' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    await prisma.task.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting task' });
  }
};

// Comments
export const listComments = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const comments = await prisma.taskComment.findMany({
      where: { task_id: id },
      orderBy: { created_date: 'asc' }
    });
    return res.status(200).json({ success: true, data: comments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing comments' });
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Comment content is required' });
  }

  try {
    const comment = await prisma.taskComment.create({
      data: {
        task_id: id,
        employee_id: req.employee?.id || 'unknown',
        employee_name: req.employee?.full_name || 'Anonymous',
        content
      }
    });
    return res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating comment' });
  }
};

// Checklist
export const createChecklist = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Checklist text is required' });
  }

  try {
    const item = await prisma.taskChecklist.create({
      data: {
        task_id: id,
        text,
        completed: completed || false
      }
    });
    return res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating checklist item' });
  }
};

export const updateChecklistStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { checklistId } = req.params;
  const { completed } = req.body;

  if (completed === undefined) {
    return res.status(400).json({ success: false, message: 'Completed status is required' });
  }

  try {
    const updated = await prisma.taskChecklist.update({
      where: { id: checklistId },
      data: { completed }
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating checklist item' });
  }
};

export const listAttachments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attachments = await prisma.taskAttachment.findMany({
      where: { task_id: req.params.id }, orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: attachments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing attachments' });
  }
};

export const createAttachment = async (req: AuthenticatedRequest, res: Response) => {
  const { file_name, mime_type, size, data_url } = req.body;
  if (!file_name || !data_url) return res.status(400).json({ success: false, message: 'A file is required' });
  if (Number(size) > 5 * 1024 * 1024) return res.status(400).json({ success: false, message: 'File must be 5 MB or smaller' });
  try {
    const attachment = await prisma.taskAttachment.create({ data: {
      task_id: req.params.id, file_name, mime_type: mime_type || 'application/octet-stream',
      size: Number(size) || 0, data_url, uploaded_by: req.employee?.full_name || null
    }});
    return res.status(201).json({ success: true, data: attachment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error uploading attachment' });
  }
};

export const deleteAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.taskAttachment.delete({ where: { id: req.params.attachmentId } });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting attachment' });
  }
};
