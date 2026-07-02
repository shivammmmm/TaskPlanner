import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Check if Super Admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@taskplanner.com' }
  });

  let adminUser;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.user.create({
      data: {
        id: 'usr-admin',
        email: 'admin@taskplanner.com',
        full_name: 'System Admin',
        role: 'super_admin',
        password: hashedPassword
      }
    });
    console.log('Created Super Admin user: admin@taskplanner.com');
  } else {
    adminUser = existingAdmin;
    console.log('Super Admin user already exists');
  }

  // 2. Check if Super Admin employee profile exists
  const existingAdminEmp = await prisma.employee.findUnique({
    where: { email: 'admin@taskplanner.com' }
  });

  if (!existingAdminEmp) {
    await prisma.employee.create({
      data: {
        id: 'emp-admin',
        user_id: adminUser.id,
        full_name: 'System Admin',
        email: 'admin@taskplanner.com',
        role: 'super_admin',
        status: 'active',
        employee_code: 'EMP-ADMIN',
        joining_date: '2026-01-01',
        phone: '+1 (555) 019-2834',
        department: 'Administration',
        designation: 'Chief Operations Officer'
      }
    });
    console.log('Created Super Admin employee profile');
  }

  // 3. Seed other initial team members
  const seedUsers = [
    { id: 'usr-jane', email: 'jane.manager@taskplanner.com', full_name: 'Jane Cooper', role: 'manager', empId: 'emp-jane', code: 'EMP-001', dept: 'Product Management', desig: 'Senior Product Manager' },
    { id: 'usr-alex', email: 'alex.lead@taskplanner.com', full_name: 'Alex Rivera', role: 'team_leader', empId: 'emp-alex', code: 'EMP-002', dept: 'Engineering', desig: 'Tech Lead' },
    { id: 'usr-cody', email: 'cody.dev@taskplanner.com', full_name: 'Cody Fisher', role: 'employee', empId: 'emp-cody', code: 'EMP-003', dept: 'Engineering', desig: 'Software Engineer' }
  ];

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  for (const s of seedUsers) {
    const userExist = await prisma.user.findUnique({ where: { email: s.email } });
    let dbUser;
    if (!userExist) {
      dbUser = await prisma.user.create({
        data: {
          id: s.id,
          email: s.email,
          full_name: s.full_name,
          role: s.role,
          password: defaultPasswordHash
        }
      });
      console.log(`Created user: ${s.email}`);
    } else {
      dbUser = userExist;
    }

    const empExist = await prisma.employee.findUnique({ where: { email: s.email } });
    if (!empExist) {
      await prisma.employee.create({
        data: {
          id: s.empId,
          user_id: dbUser.id,
          full_name: s.full_name,
          email: s.email,
          role: s.role,
          status: 'active',
          employee_code: s.code,
          joining_date: '2026-02-15',
          phone: '+1 (555) 014-3847',
          department: s.dept,
          designation: s.desig
        }
      });
      console.log(`Created employee profile for: ${s.email}`);
    }
  }

  // 4. Seed default Company Settings if empty
  const settingsCount = await prisma.companySettings.count();
  if (settingsCount === 0) {
    await prisma.companySettings.create({
      data: {
        id: 'settings-default',
        company_name: 'Apex Solutions',
        address: '100 Innovation Way, Suite 400',
        phone: '+1 (555) 019-9000',
        email: 'info@apexsolutions.com',
        website: 'www.apexsolutions.com',
        logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&auto=format',
        working_days: 5,
        working_hours: 8
      }
    });
    console.log('Created default company settings');
  }

  // 5. Seed default Buckets if empty
  const bucketsCount = await prisma.bucket.count();
  if (bucketsCount === 0) {
    await prisma.bucket.createMany({
      data: [
        { id: 'buc-q3proj', name: 'Q3 Product Roadmap', description: 'Major feature additions and UX refinement projects.', color: '#3B82F6', status: 'active', due_date: '2026-09-30' },
        { id: 'buc-infra', name: 'Cloud Infrastructure Upgrade', description: 'Migration of static resources and database optimization.', color: '#10B981', status: 'active', due_date: '2026-08-15' },
        { id: 'buc-support', name: 'Customer Support Retrospective', description: 'Addressing key bug reports and general client queries.', color: '#EF4444', status: 'active', due_date: '2026-07-31' }
      ]
    });
    console.log('Seeded initial buckets');
  }

  // 6. Seed initial Tasks if empty
  const tasksCount = await prisma.task.count();
  if (tasksCount === 0) {
    const task1 = await prisma.task.create({
      data: {
        id: 'tsk-001',
        title: 'Prepare standard documents and checklist for new hires',
        description: 'Create an editable PDF checklist for HR and compile necessary forms.',
        bucket_id: 'buc-q3proj',
        bucket_name: 'Q3 Product Roadmap',
        assigned_to_id: 'emp-jane',
        assigned_to_name: 'Jane Cooper',
        assigned_by_id: 'emp-admin',
        assigned_by_name: 'System Admin',
        priority: 'medium',
        status: 'completed',
        start_date: '2026-06-01',
        due_date: '2026-06-15',
        estimated_hours: 4.5,
        is_recurring: false,
        labels: ['HR', 'Documentation'],
        completed_at: new Date(Date.now() - 3600000).toISOString()
      }
    });

    await prisma.taskChecklist.createMany({
      data: [
        { text: 'Compile IRS Form W-4', completed: true, task_id: task1.id },
        { text: 'Verify I-9 document requirements', completed: true, task_id: task1.id },
        { text: 'Create standard offer letter template', completed: true, task_id: task1.id }
      ]
    });

    const task2 = await prisma.task.create({
      data: {
        id: 'tsk-002',
        title: 'Migrate state management from Redux to Zustand',
        description: 'Refactor core application slices and hook selectors into Zustand stores.',
        bucket_id: 'buc-infra',
        bucket_name: 'Cloud Infrastructure Upgrade',
        assigned_to_id: 'emp-cody',
        assigned_to_name: 'Cody Fisher',
        assigned_by_id: 'emp-alex',
        assigned_by_name: 'Alex Rivera',
        priority: 'high',
        status: 'in_progress',
        start_date: '2026-06-10',
        due_date: '2026-07-10',
        estimated_hours: 12,
        is_recurring: false,
        labels: ['Refactor', 'Frontend']
      }
    });

    await prisma.taskChecklist.createMany({
      data: [
        { text: 'Create auth state store slice', completed: true, task_id: task2.id },
        { text: 'Migrate dashboard telemetry logic', completed: false, task_id: task2.id },
        { text: 'Verify action dispatch replacement coverage', completed: false, task_id: task2.id }
      ]
    });

    console.log('Seeded initial tasks and checklists');
  }

  // 7. Seed initial Holidays if empty
  const holidaysCount = await prisma.holiday.count();
  if (holidaysCount === 0) {
    await prisma.holiday.createMany({
      data: [
        { name: "New Year's Day", date: '2026-01-01', type: 'public' },
        { name: 'Independence Day', date: '2026-07-04', type: 'public' },
        { name: 'Thanksgiving Day', date: '2026-11-26', type: 'public' },
        { name: 'Christmas Day', date: '2026-12-25', type: 'public' },
        { name: 'Company Foundation Day', date: '2026-10-15', type: 'company' }
      ]
    });
    console.log('Seeded initial holidays');
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
