import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  employee?: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskplanner-super-secret-jwt-signing-key-2026') as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const employee = await prisma.employee.findUnique({ where: { user_id: user.id } });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'employee',
    };

    if (employee) {
      req.employee = {
        id: employee.id,
        user_id: employee.user_id,
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Super Admin role required.' });
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role !== 'super_admin' && role !== 'company_admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
};

export const requireManager = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role !== 'super_admin' && role !== 'company_admin' && role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Access denied. Manager role required.' });
  }
  next();
};
