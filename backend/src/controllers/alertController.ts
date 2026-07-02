import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listAlerts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.externalAlert.findMany({
      orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing alerts' });
  }
};

export const createAlert = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, priority, status, expiry_date } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Alert title is required' });
  }

  try {
    const alert = await prisma.externalAlert.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'medium',
        status: status || 'active',
        expiry_date: expiry_date || null
      }
    });

    return res.status(201).json({ success: true, data: alert });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating alert' });
  }
};

export const updateAlert = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, priority, status, expiry_date } = req.body;

  try {
    const record = await prisma.externalAlert.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const updated = await prisma.externalAlert.update({
      where: { id },
      data: {
        title: title !== undefined ? title : record.title,
        description: description !== undefined ? description : record.description,
        priority: priority !== undefined ? priority : record.priority,
        status: status !== undefined ? status : record.status,
        expiry_date: expiry_date !== undefined ? expiry_date : record.expiry_date
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating alert' });
  }
};

export const deleteAlert = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.externalAlert.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    await prisma.externalAlert.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Alert deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting alert' });
  }
};
