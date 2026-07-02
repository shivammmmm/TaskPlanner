import { Employee, Bucket, Task, CompanySettings, Holiday, Notice, Meeting, Item } from '../types/entities';

export const SEED_USERS = [
  { id: 'usr-admin', email: 'admin@taskplanner.com', full_name: 'System Admin', role: 'admin' },
  { id: 'usr-jane', email: 'jane.manager@taskplanner.com', full_name: 'Jane Cooper', role: 'user' },
  { id: 'usr-alex', email: 'alex.lead@taskplanner.com', full_name: 'Alex Rivera', role: 'user' },
  { id: 'usr-cody', email: 'cody.dev@taskplanner.com', full_name: 'Cody Fisher', role: 'user' }
];

export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin',
    user_id: 'usr-admin',
    full_name: 'System Admin',
    email: 'admin@taskplanner.com',
    role: 'company_admin',
    status: 'active',
    employee_code: 'EMP-ADMIN',
    joining_date: '2026-01-01',
    phone: '+1 (555) 019-2834',
    department: 'Administration',
    designation: 'Chief Operations Officer',
    created_date: new Date().toISOString()
  },
  {
    id: 'emp-jane',
    user_id: 'usr-jane',
    full_name: 'Jane Cooper',
    email: 'jane.manager@taskplanner.com',
    role: 'manager',
    status: 'active',
    employee_code: 'EMP-001',
    joining_date: '2026-02-15',
    phone: '+1 (555) 014-3847',
    department: 'Product Management',
    designation: 'Senior Product Manager',
    created_date: new Date().toISOString()
  },
  {
    id: 'emp-alex',
    user_id: 'usr-alex',
    full_name: 'Alex Rivera',
    email: 'alex.lead@taskplanner.com',
    role: 'team_leader',
    status: 'active',
    employee_code: 'EMP-002',
    joining_date: '2026-03-01',
    phone: '+1 (555) 017-4829',
    department: 'Engineering',
    designation: 'Tech Lead',
    created_date: new Date().toISOString()
  },
  {
    id: 'emp-cody',
    user_id: 'usr-cody',
    full_name: 'Cody Fisher',
    email: 'cody.dev@taskplanner.com',
    role: 'employee',
    status: 'active',
    employee_code: 'EMP-003',
    joining_date: '2026-04-10',
    phone: '+1 (555) 012-9481',
    department: 'Engineering',
    designation: 'Software Engineer',
    created_date: new Date().toISOString()
  }
];

export const SEED_BUCKETS: Bucket[] = [
  { id: 'bkt-core', name: 'Core Platform Refactoring', description: 'Major code clean-up and architectural improvements.', color: 'indigo', status: 'active', due_date: '2026-09-30', created_date: new Date().toISOString() },
  { id: 'bkt-onboard', name: 'Employee Onboarding Flow', description: 'Redesigning the onboarding and welcome experience.', color: 'emerald', status: 'active', due_date: '2026-08-15', created_date: new Date().toISOString() },
  { id: 'bkt-ops', name: 'Internal Operations', description: 'General day-to-day operations and internal tools.', color: 'amber', status: 'active', due_date: '2026-12-31', created_date: new Date().toISOString() }
];

export const SEED_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Migrate state management from Redux to Zustand',
    description: 'Simplify state updates in the dashboard and clean up boilerplate.',
    bucket_id: 'bkt-core',
    bucket_name: 'Core Platform Refactoring',
    assigned_to_id: 'usr-cody',
    assigned_to_name: 'Cody Fisher',
    assigned_by_id: 'usr-alex',
    assigned_by_name: 'Alex Rivera',
    priority: 'high',
    status: 'in_progress',
    start_date: '2026-07-01',
    due_date: '2026-07-10',
    estimated_hours: 16,
    is_recurring: false,
    created_date: new Date().toISOString()
  },
  {
    id: 'tsk-2',
    title: 'Implement OAuth sign-in flow',
    description: 'Add support for Google and GitHub authentication on the login page.',
    bucket_id: 'bkt-core',
    bucket_name: 'Core Platform Refactoring',
    assigned_to_id: 'usr-alex',
    assigned_to_name: 'Alex Rivera',
    assigned_by_id: 'usr-jane',
    assigned_by_name: 'Jane Cooper',
    priority: 'urgent',
    status: 'todo',
    start_date: '2026-07-02',
    due_date: '2026-07-08',
    estimated_hours: 24,
    is_recurring: false,
    created_date: new Date().toISOString()
  },
  {
    id: 'tsk-3',
    title: 'Prepare standard documents and checklist for new hires',
    description: 'Create an editable PDF checklist for HR and compile necessary forms.',
    bucket_id: 'bkt-onboard',
    bucket_name: 'Employee Onboarding Flow',
    assigned_to_id: 'usr-jane',
    assigned_to_name: 'Jane Cooper',
    assigned_by_id: 'usr-admin',
    assigned_by_name: 'System Admin',
    priority: 'medium',
    status: 'completed',
    start_date: '2026-06-20',
    due_date: '2026-06-30',
    estimated_hours: 8,
    is_recurring: false,
    completed_at: new Date().toISOString(),
    created_date: new Date().toISOString()
  },
  {
    id: 'tsk-4',
    title: 'Weekly server backup and logs rotation',
    description: 'Automated job to verify database integrity and compress logs files.',
    bucket_id: 'bkt-ops',
    bucket_name: 'Internal Operations',
    assigned_to_id: 'usr-admin',
    assigned_to_name: 'System Admin',
    assigned_by_id: 'usr-admin',
    assigned_by_name: 'System Admin',
    priority: 'low',
    status: 'todo',
    start_date: '2026-07-02',
    due_date: '2026-07-09',
    estimated_hours: 2,
    is_recurring: true,
    recurrence_pattern: 'weekly',
    created_date: new Date().toISOString()
  }
];

export const SEED_SETTINGS: CompanySettings = {
  id: 'company-settings',
  company_name: 'Apex Taskplanner Inc.',
  address: '100 Innovation Way, Suite 400, Tech City, TC 94016',
  phone: '+1 (555) 010-0000',
  email: 'ops@taskplanner.com',
  website: 'https://taskplanner.apex.io',
  working_days: 5,
  working_hours: 8,
  created_date: new Date().toISOString()
};

export const SEED_HOLIDAYS: Holiday[] = [
  { id: 'hol-1', name: 'New Year Day', date: '2026-01-01', type: 'public' },
  { id: 'hol-2', name: 'Independence Day', date: '2026-07-04', type: 'public' },
  { id: 'hol-3', name: 'Company Foundation Day', date: '2026-10-15', type: 'company' },
  { id: 'hol-4', name: 'Christmas Day', date: '2026-12-25', type: 'public' }
];

export const SEED_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Q3 Product Strategy Alignment Meeting',
    content: 'Please make sure to update your current board items before the alignment meeting scheduled on Monday. Attendance is required for all project leads.',
    priority: 'high',
    published_by: 'Jane Cooper',
    expiry_date: '2026-07-10',
    created_date: new Date().toISOString()
  },
  {
    id: 'not-2',
    title: 'Office Upgrades & Maintenance Workspace Changes',
    content: 'The 4th floor lounge area will be closed for remodeling from July 5th to July 12th. Noise level is expected to be minimal.',
    priority: 'low',
    published_by: 'System Admin',
    expiry_date: '2026-07-15',
    created_date: new Date().toISOString()
  }
];

export const SEED_MEETINGS: Meeting[] = [
  {
    id: 'mtg-1',
    title: 'Daily Standup',
    description: 'Quick sync on active sprint tasks and blockers.',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    duration: 15,
    link: 'https://meet.google.com/abc-defg-hij',
    attendees: ['usr-jane', 'usr-alex', 'usr-cody'],
    created_date: new Date().toISOString()
  },
  {
    id: 'mtg-2',
    title: 'Sizing & Backlog Refinement',
    description: 'Review new requirements and estimate efforts for upcoming buckets.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days later
    time: '14:00',
    duration: 60,
    link: 'https://meet.google.com/xyz-uvwx-yza',
    attendees: ['usr-jane', 'usr-alex'],
    created_date: new Date().toISOString()
  }
];

export const SEED_ITEMS: Item[] = [
  { id: 'itm-1', name: 'MacBook Pro 16" (M3 Max)', description: 'Developer workstation', category: 'Hardware', quantity: 5, status: 'available', created_date: new Date().toISOString() },
  { id: 'itm-2', name: 'Dell UltraSharp 32" 4K Monitor', description: 'Design & Review monitor', category: 'Peripherals', quantity: 2, status: 'low_stock', created_date: new Date().toISOString() },
  { id: 'itm-3', name: 'IntelliJ IDEA Ultimate License', description: 'IDE subscription', category: 'Software License', quantity: 10, status: 'available', created_date: new Date().toISOString() }
];
