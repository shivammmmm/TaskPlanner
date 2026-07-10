import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Middleware
import { authenticateJWT, requireSuperAdmin, requireAdmin } from './middleware/auth';

// Controllers
import * as authController from './controllers/authController';
import * as teamController from './controllers/teamController';
import * as bucketController from './controllers/bucketController';
import * as taskController from './controllers/taskController';
import * as attendanceController from './controllers/attendanceController';
import * as timesheetController from './controllers/timesheetController';
import * as meetingController from './controllers/meetingController';
import * as noticeController from './controllers/noticeController';
import * as itemController from './controllers/itemController';
import * as alertController from './controllers/alertController';
import * as notificationController from './controllers/notificationController';
import * as settingsController from './controllers/settingsController';
import * as reportController from './controllers/reportController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

// Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '7mb' }));

// Auth routes
app.post('/api/auth/login', authLimiter, authController.login);
app.get('/api/auth/me', authenticateJWT, authController.getMe);
app.put('/api/auth/me', authenticateJWT, authController.updateMe);
app.post('/api/auth/logout', authController.logout);
app.post('/api/auth/change-password', authenticateJWT, authController.changePassword);

// Team Members (Employees) - Only Super Admin can write/delete/status patch, anyone authenticated can read
app.get('/api/team-members', authenticateJWT, teamController.listEmployees);
app.post('/api/team-members', authenticateJWT, requireSuperAdmin, teamController.createEmployee);
app.get('/api/team-members/:id', authenticateJWT, teamController.getEmployeeById);
app.put('/api/team-members/:id', authenticateJWT, requireSuperAdmin, teamController.updateEmployee);
app.patch('/api/team-members/:id/status', authenticateJWT, requireSuperAdmin, teamController.updateEmployeeStatus);
app.delete('/api/team-members/:id', authenticateJWT, requireSuperAdmin, teamController.deleteEmployee);

// Buckets
app.get('/api/buckets', authenticateJWT, bucketController.listBuckets);
app.post('/api/buckets', authenticateJWT, bucketController.createBucket);
app.get('/api/buckets/:id', authenticateJWT, bucketController.getBucketById);
app.put('/api/buckets/:id', authenticateJWT, bucketController.updateBucket);
app.delete('/api/buckets/:id', authenticateJWT, bucketController.deleteBucket);

// Tasks
app.get('/api/tasks', authenticateJWT, taskController.listTasks);
app.post('/api/tasks', authenticateJWT, taskController.createTask);
app.get('/api/tasks/:id', authenticateJWT, taskController.getTaskById);
app.put('/api/tasks/:id', authenticateJWT, taskController.updateTask);
app.delete('/api/tasks/:id', authenticateJWT, taskController.deleteTask);
app.patch('/api/tasks/:id/status', authenticateJWT, taskController.updateTaskStatus);

// Task comments, checklists
app.get('/api/tasks/:id/comments', authenticateJWT, taskController.listComments);
app.post('/api/tasks/:id/comments', authenticateJWT, taskController.createComment);
app.post('/api/tasks/:id/checklist', authenticateJWT, taskController.createChecklist);
app.patch('/api/tasks/:id/checklist/:checklistId', authenticateJWT, taskController.updateChecklistStatus);
app.get('/api/tasks/:id/attachments', authenticateJWT, taskController.listAttachments);
app.post('/api/tasks/:id/attachments', authenticateJWT, taskController.createAttachment);
app.delete('/api/tasks/:id/attachments/:attachmentId', authenticateJWT, taskController.deleteAttachment);

// Attendance
app.get('/api/attendance', authenticateJWT, attendanceController.listAttendance);
app.post('/api/attendance', authenticateJWT, attendanceController.createAttendance);
app.put('/api/attendance/:id', authenticateJWT, attendanceController.updateAttendance);
app.delete('/api/attendance/:id', authenticateJWT, attendanceController.deleteAttendance);

// Timesheets
app.get('/api/timesheets', authenticateJWT, timesheetController.listTimesheets);
app.post('/api/timesheets', authenticateJWT, timesheetController.createTimesheet);
app.put('/api/timesheets/:id', authenticateJWT, timesheetController.updateTimesheet);
app.delete('/api/timesheets/:id', authenticateJWT, timesheetController.deleteTimesheet);

// Meetings
app.get('/api/meetings', authenticateJWT, meetingController.listMeetings);
app.post('/api/meetings', authenticateJWT, meetingController.createMeeting);
app.put('/api/meetings/:id', authenticateJWT, meetingController.updateMeeting);
app.delete('/api/meetings/:id', authenticateJWT, meetingController.deleteMeeting);

// Notice Board
app.get('/api/notices', authenticateJWT, noticeController.listNotices);
app.post('/api/notices', authenticateJWT, noticeController.createNotice);
app.put('/api/notices/:id', authenticateJWT, noticeController.updateNotice);
app.delete('/api/notices/:id', authenticateJWT, noticeController.deleteNotice);

// Items (Inventory)
app.get('/api/items', authenticateJWT, itemController.listItems);
app.post('/api/items', authenticateJWT, itemController.createItem);
app.put('/api/items/:id', authenticateJWT, itemController.updateItem);
app.delete('/api/items/:id', authenticateJWT, itemController.deleteItem);

// External Alerts
app.get('/api/external-alerts', authenticateJWT, alertController.listAlerts);
app.post('/api/external-alerts', authenticateJWT, alertController.createAlert);
app.put('/api/external-alerts/:id', authenticateJWT, alertController.updateAlert);
app.delete('/api/external-alerts/:id', authenticateJWT, alertController.deleteAlert);

// Notifications
app.get('/api/notifications', authenticateJWT, notificationController.listNotifications);
app.post('/api/notifications', authenticateJWT, notificationController.createNotification);
app.patch('/api/notifications/:id/read', authenticateJWT, notificationController.markAsRead);
app.patch('/api/notifications/read-all', authenticateJWT, notificationController.markAllAsRead);

// Settings - Admin or Super Admin to write/update, others read
app.get('/api/settings', authenticateJWT, settingsController.getSettings);
app.put('/api/settings', authenticateJWT, requireAdmin, settingsController.updateSettings);

// Holidays - Admin or Super Admin to write/update/delete, others read
app.get('/api/holidays', authenticateJWT, settingsController.listHolidays);
app.post('/api/holidays', authenticateJWT, requireAdmin, settingsController.createHoliday);
app.put('/api/holidays/:id', authenticateJWT, requireAdmin, settingsController.updateHoliday);
app.delete('/api/holidays/:id', authenticateJWT, requireAdmin, settingsController.deleteHoliday);

// Reports / Dashboard Logs
app.get('/api/reports/dashboard', authenticateJWT, reportController.getDashboardLogs);
app.post('/api/reports/activity-logs', authenticateJWT, reportController.createActivityLog);
app.get('/api/reports/tasks', authenticateJWT, reportController.getTaskReports);
app.get('/api/reports/attendance', authenticateJWT, reportController.getAttendanceReports);
app.get('/api/reports/timesheets', authenticateJWT, reportController.getTimesheetReports);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred on the server'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
