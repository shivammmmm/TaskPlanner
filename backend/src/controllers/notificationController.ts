import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listNotifications = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const list = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_date: 'desc' }
    });

    if (list.length === 0) {
      const defaultNotifications = [
        {
          user_id: req.user.id,
          title: 'Welcome to Apex Taskplanner',
          message: 'Get started by checking your active tasks or marking your daily attendance.',
          type: 'info',
          is_read: false,
          link: '/'
        },
        {
          user_id: req.user.id,
          title: 'New Notice Published',
          message: 'Jane Cooper published: "Q3 Product Strategy Alignment Meeting"',
          type: 'notice',
          is_read: false,
          link: '/notices'
        }
      ];
      await prisma.notification.createMany({ data: defaultNotifications });
      const seededList = await prisma.notification.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_date: 'desc' }
      });
      return res.status(200).json({ success: true, data: seededList });
    }

    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing notifications' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const record = await prisma.notification.findFirst({
      where: { id, user_id: req.user.id }
    });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { is_read: true }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating notification' });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true }
    });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error marking notifications as read' });
  }
};

export const createNotification = async (req: AuthenticatedRequest, res: Response) => {
  const { user_id, title, message, type, link } = req.body;

  if (!user_id || !title || !message) {
    return res.status(400).json({ success: false, message: 'User ID, title, and message are required' });
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        type: type || 'info',
        is_read: false,
        link: link || null
      }
    });

    return res.status(201).json({ success: true, data: notification });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating notification' });
  }
};
