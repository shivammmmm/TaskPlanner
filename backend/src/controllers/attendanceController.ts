import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.attendance.findMany({
      orderBy: { date: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing attendance' });
  }
};

export const createAttendance = async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, employee_name, date, status, clock_in, clock_out, working_hours, notes } = req.body;

  if (!date || !status) {
    return res.status(400).json({ success: false, message: 'Date and status are required' });
  }

  try {
    const empId = employee_id || req.employee?.id || 'unknown';
    const empName = employee_name || req.employee?.full_name || 'Anonymous';

    const attendance = await prisma.attendance.create({
      data: {
        employee_id: empId,
        employee_name: empName,
        date,
        status,
        clock_in: clock_in || null,
        clock_out: clock_out || null,
        working_hours: working_hours !== undefined ? parseFloat(working_hours) : null,
        notes: notes || null
      }
    });

    return res.status(201).json({ success: true, data: attendance });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating attendance' });
  }
};

export const updateAttendance = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, clock_in, clock_out, working_hours, notes } = req.body;

  try {
    const record = await prisma.attendance.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: status !== undefined ? status : record.status,
        clock_in: clock_in !== undefined ? clock_in : record.clock_in,
        clock_out: clock_out !== undefined ? clock_out : record.clock_out,
        working_hours: working_hours !== undefined ? parseFloat(working_hours) : record.working_hours,
        notes: notes !== undefined ? notes : record.notes
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating attendance' });
  }
};

export const deleteAttendance = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.attendance.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    await prisma.attendance.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting attendance' });
  }
};
