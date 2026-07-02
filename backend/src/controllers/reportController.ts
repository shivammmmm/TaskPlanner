import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

// Activity Logs (mapped to reportService.getActivityLogs)
export const getDashboardLogs = async (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
  try {
    const logs = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { created_date: 'desc' }
    });

    // Seed default logs if empty
    if (logs.length === 0) {
      const initialLogs = [
        { user_name: 'Jane Cooper', action: 'task_completed', details: 'completed task "Prepare standard documents and checklist for new hires"', created_date: new Date(Date.now() - 3600000) },
        { user_name: 'Alex Rivera', action: 'task_started', details: 'started task "Migrate state management from Redux to Zustand"', created_date: new Date(Date.now() - 7200000) },
        { user_name: 'System Admin', action: 'bucket_created', details: 'created bucket "Core Platform Refactoring"', created_date: new Date(Date.now() - 86400000) }
      ];
      await prisma.activityLog.createMany({ data: initialLogs });
      const freshLogs = await prisma.activityLog.findMany({
        take: limit,
        orderBy: { created_date: 'desc' }
      });
      return res.status(200).json({ success: true, data: freshLogs });
    }

    return res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching activity logs' });
  }
};

export const createActivityLog = async (req: AuthenticatedRequest, res: Response) => {
  const { user_name, action, details } = req.body;

  if (!action || !details) {
    return res.status(400).json({ success: false, message: 'Action and details are required' });
  }

  try {
    const userName = user_name || req.employee?.full_name || 'System Admin';
    const log = await prisma.activityLog.create({
      data: {
        user_name: userName,
        action,
        details
      }
    });
    return res.status(201).json({ success: true, data: log });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error logging activity' });
  }
};

// Summary metrics placeholders if accessed
export const getTaskReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany();
    return res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching task reports' });
  }
};

export const getAttendanceReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.attendance.findMany();
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching attendance reports' });
  }
};

export const getTimesheetReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.timesheet.findMany();
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching timesheet reports' });
  }
};
