import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'taskplanner-super-secret-jwt-signing-key-2026';

export const login = async (req: any, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching user profile' });
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { full_name } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { full_name }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        role: updated.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating user profile' });
  }
};

export const logout = async (req: any, res: Response) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error changing password' });
  }
};
