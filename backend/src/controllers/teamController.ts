import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, email, status, role } = req.query as Record<string, string>;

    // Build dynamic where clause from query params
    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (email) where.email = email;
    if (status) where.status = status;
    if (role) where.role = role;

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: employees });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing employees' });
  }
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.findUnique({
      where: { id }
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    return res.status(200).json({ success: true, data: employee });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching employee' });
  }
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const {
    full_name, email, password, mobile, employee_code,
    department, designation, role, joining_date, status
  } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Full name, email, password, and role are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User record
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        full_name,
        role
      }
    });

    // Create Employee record
    const employee = await prisma.employee.create({
      data: {
        user_id: user.id,
        full_name,
        email: email.toLowerCase(),
        role,
        status: status || 'active',
        employee_code: employee_code || 'EMP-' + Date.now().toString(36).toUpperCase(),
        joining_date: joining_date || new Date().toISOString().split('T')[0],
        phone: mobile || null, // Map mobile to phone
        department: department || null,
        designation: designation || null
      }
    });

    return res.status(201).json({ success: true, data: employee });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating employee' });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    full_name, email, password, mobile, employee_code,
    department, designation, role, joining_date, status
  } = req.body;

  try {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update corresponding user record
    const userUpdateData: any = {};
    if (full_name) userUpdateData.full_name = full_name;
    if (email) userUpdateData.email = email.toLowerCase();
    if (role) userUpdateData.role = role;
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id: employee.user_id },
      data: userUpdateData
    });

    // Update employee record
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        full_name: full_name || employee.full_name,
        email: email ? email.toLowerCase() : employee.email,
        role: role || employee.role,
        status: status || employee.status,
        employee_code: employee_code || employee.employee_code,
        joining_date: joining_date || employee.joining_date,
        phone: mobile !== undefined ? mobile : employee.phone,
        department: department !== undefined ? department : employee.department,
        designation: designation !== undefined ? designation : employee.designation
      }
    });

    return res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating employee' });
  }
};

export const updateEmployeeStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { status }
    });
    return res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating status' });
  }
};

export const deleteEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete User record (cascade deletes Employee automatically due to DB relation, but we can delete user explicitly to trigger cascade)
    await prisma.user.delete({
      where: { id: employee.user_id }
    });

    return res.status(200).json({ success: true, message: 'Employee and user account deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting employee' });
  }
};
