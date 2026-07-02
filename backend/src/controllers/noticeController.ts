import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listNotices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.notice.findMany({
      orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing notices' });
  }
};

export const createNotice = async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, priority, published_by, expiry_date } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  try {
    const publisher = published_by || req.employee?.full_name || 'System Admin';
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || 'medium',
        published_by: publisher,
        expiry_date: expiry_date || null
      }
    });

    return res.status(201).json({ success: true, data: notice });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating notice' });
  }
};

export const updateNotice = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, priority, published_by, expiry_date } = req.body;

  try {
    const record = await prisma.notice.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        title: title !== undefined ? title : record.title,
        content: content !== undefined ? content : record.content,
        priority: priority !== undefined ? priority : record.priority,
        published_by: published_by !== undefined ? published_by : record.published_by,
        expiry_date: expiry_date !== undefined ? expiry_date : record.expiry_date
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating notice' });
  }
};

export const deleteNotice = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.notice.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    await prisma.notice.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting notice' });
  }
};
