import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listTimesheets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.timesheet.findMany({
      orderBy: { date: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing timesheets' });
  }
};

export const createTimesheet = async (req: AuthenticatedRequest, res: Response) => {
  const {
    employee_id, employee_name, date, clock_in, clock_out,
    hours, task_id, task_title, bucket_id, bucket_name, description
  } = req.body;

  if (!date || !clock_in) {
    return res.status(400).json({ success: false, message: 'Date and clock-in time are required' });
  }

  try {
    const empId = employee_id || req.employee?.id || 'unknown';
    const empName = employee_name || req.employee?.full_name || 'Anonymous';

    const timesheet = await prisma.timesheet.create({
      data: {
        employee_id: empId,
        employee_name: empName,
        date,
        clock_in,
        clock_out: clock_out || null,
        hours: hours !== undefined ? parseFloat(hours) : null,
        task_id: task_id || null,
        task_title: task_title || null,
        bucket_id: bucket_id || null,
        bucket_name: bucket_name || null,
        description: description || null
      }
    });

    return res.status(201).json({ success: true, data: timesheet });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating timesheet' });
  }
};

export const updateTimesheet = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    date, clock_in, clock_out, hours,
    task_id, task_title, bucket_id, bucket_name, description
  } = req.body;

  try {
    const record = await prisma.timesheet.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Timesheet record not found' });
    }

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        date: date !== undefined ? date : record.date,
        clock_in: clock_in !== undefined ? clock_in : record.clock_in,
        clock_out: clock_out !== undefined ? clock_out : record.clock_out,
        hours: hours !== undefined ? parseFloat(hours) : record.hours,
        task_id: task_id !== undefined ? task_id : record.task_id,
        task_title: task_title !== undefined ? task_title : record.task_title,
        bucket_id: bucket_id !== undefined ? bucket_id : record.bucket_id,
        bucket_name: bucket_name !== undefined ? bucket_name : record.bucket_name,
        description: description !== undefined ? description : record.description
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating timesheet' });
  }
};

export const deleteTimesheet = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.timesheet.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Timesheet record not found' });
    }
    await prisma.timesheet.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Timesheet record deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting timesheet' });
  }
};
