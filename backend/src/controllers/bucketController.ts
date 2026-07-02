import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listBuckets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buckets = await prisma.bucket.findMany({
      orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: buckets });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing buckets' });
  }
};

export const getBucketById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const bucket = await prisma.bucket.findUnique({
      where: { id }
    });
    if (!bucket) {
      return res.status(404).json({ success: false, message: 'Bucket not found' });
    }
    return res.status(200).json({ success: true, data: bucket });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching bucket' });
  }
};

export const createBucket = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, color, status, due_date } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Bucket name is required' });
  }
  try {
    const bucket = await prisma.bucket.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        status: status || 'active',
        due_date: due_date || null
      }
    });
    return res.status(201).json({ success: true, data: bucket });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating bucket' });
  }
};

export const updateBucket = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, color, status, due_date } = req.body;
  try {
    const bucket = await prisma.bucket.findUnique({ where: { id } });
    if (!bucket) {
      return res.status(404).json({ success: false, message: 'Bucket not found' });
    }
    const updated = await prisma.bucket.update({
      where: { id },
      data: {
        name: name !== undefined ? name : bucket.name,
        description: description !== undefined ? description : bucket.description,
        color: color !== undefined ? color : bucket.color,
        status: status !== undefined ? status : bucket.status,
        due_date: due_date !== undefined ? due_date : bucket.due_date
      }
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating bucket' });
  }
};

export const deleteBucket = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const bucket = await prisma.bucket.findUnique({ where: { id } });
    if (!bucket) {
      return res.status(404).json({ success: false, message: 'Bucket not found' });
    }
    await prisma.bucket.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Bucket deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting bucket' });
  }
};
