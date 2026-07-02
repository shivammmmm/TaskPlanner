export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  password?: string;
}

export interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'manager' | 'team_leader' | 'employee';
  status: 'active' | 'inactive';
  employee_code: string;
  joining_date: string;
  phone?: string;
  department?: string;
  designation?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Bucket {
  id: string;
  name: string;
  description?: string;
  color?: string;
  status: 'active' | 'archived';
  due_date?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  bucket_id?: string;
  bucket_name?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  assigned_by_id?: string;
  assigned_by_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'archived';
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  is_recurring: boolean;
  recurrence_pattern?: 'none' | 'daily' | 'weekly' | 'monthly';
  labels?: string[];
  completed_at?: string;
  created_date?: string;
  updated_date?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  employee_id: string;
  employee_name: string;
  content: string;
  created_date: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'wfh' | 'leave';
  clock_in?: string;
  clock_out?: string;
  working_hours?: number;
  notes?: string;
  created_date?: string;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  hours?: number;
  task_id?: string;
  task_title?: string;
  bucket_id?: string;
  bucket_name?: string;
  description?: string;
  created_date?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  published_by: string;
  expiry_date?: string;
  created_date: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number; // in minutes
  link?: string;
  attendees: string[]; // array of employee user_ids or emails
  created_date?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  status: 'available' | 'low_stock' | 'out_of_stock';
  created_date?: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  working_days?: number;
  working_hours?: number;
  created_date?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'company' | 'restricted';
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_date: string;
}

export interface ExternalAlert {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'resolved' | 'expired';
  expiry_date?: string;
  created_date: string;
}
